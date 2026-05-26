import { Response, NextFunction, RequestHandler } from "express";
import ClientRepository from "../modules/client/model/client.repository";
import { ClientRequest } from "../types/request.type";

interface AnnotatedClientAuth extends RequestHandler {
  __requiresClientKey?: true;
}

/**
 * Guards endpoints that are called by external client backends
 * (e.g. sdlcgames-backend → gamru-backend). The calling side must
 * include its `auth_key` from the `clientConfig` row as the
 * `x-client-auth-key` header.
 *
 *  - missing / unknown key → 401
 *  - key matches a DISABLED row → 403
 *  - on success, attaches the resolved client to `req.client` and
 *    asynchronously updates `last_seen_at` (fire-and-forget so a
 *    write failure never blocks the request).
 */
export const clientAuth: AnnotatedClientAuth = async (
  req,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const provided = req.header("x-client-auth-key");

  if (!provided) {
    res.status(401).json({
      success: false,
      message: "Missing x-client-auth-key header",
    });
    return;
  }

  try {
    const client = await ClientRepository.findByAuthKey(provided);

    if (!client) {
      res.status(401).json({
        success: false,
        message: "Invalid client auth key",
      });
      return;
    }

    if (client.status === "DISABLED") {
      res.status(403).json({
        success: false,
        message: "Client is disabled",
      });
      return;
    }

    (req as ClientRequest).client = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      skin_id: client.skin_id,
      status: client.status,
    };

    // Fire-and-forget — never block the request on a heartbeat write.
    ClientRepository.touchLastSeen(client.id).catch(() => {
      /* best-effort */
    });

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Client auth check failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

clientAuth.__requiresClientKey = true;
