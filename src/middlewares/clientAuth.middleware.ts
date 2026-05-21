import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcrypt";
import clientRepository from "../modules/client/model/client.repository";
import Client from "../modules/client/model/client.model";

export interface ClientRequest extends Request {
  client?: Client;
}

interface AnnotatedClientAuth extends RequestHandler {
  __requiresClientAuth?: true;
  __requiredScope?: string;
}

/**
 * Service-to-service auth keyed off a per-client credential pair carried
 * in `x-client-id` + `x-client-secret` headers. The middleware:
 *
 *   1. Looks up the Client by its public `client_id`.
 *   2. Confirms it's ACTIVE.
 *   3. Bcrypt-compares the provided plaintext secret against the stored hash.
 *   4. If `requiredScope` is set, confirms the client holds that scope.
 *   5. If an IP allowlist is configured, checks the request IP against it.
 *   6. Stamps `req.client` for downstream handlers and bumps `last_seen_at`.
 *
 * Backward compatibility: a request that omits `x-client-id` BUT carries
 * the legacy `x-service-key` matching `SERVICE_SHARED_KEY` is allowed
 * through under the synthetic "legacy" client. This lets pre-multiclient
 * consumers keep working for one release while they re-key. Remove the
 * legacy branch once all integrators are migrated.
 */
export const clientAuth = (requiredScope?: string): AnnotatedClientAuth => {
  const handler: AnnotatedClientAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const clientReq = req as ClientRequest;

    const providedId = req.header("x-client-id");
    const providedSecret = req.header("x-client-secret");

    // ─── Legacy fallback ────────────────────────────────────────────
    if (!providedId) {
      const legacy = req.header("x-service-key");
      const expectedLegacy = process.env.SERVICE_SHARED_KEY;
      if (legacy && expectedLegacy && legacy === expectedLegacy) {
        // Resolve the seed "Gamify Engage" client by slug so writes still
        // attribute correctly. If it isn't seeded, fall through to 401.
        const fallback = await clientRepository.findBySlug("gamify-engage");
        if (fallback && fallback.status === "ACTIVE") {
          clientReq.client = fallback;
          void touchLastSeen(fallback, req.ip);
          return next();
        }
      }
      res
        .status(401)
        .json({ success: false, message: "Missing client credentials" });
      return;
    }

    if (!providedSecret) {
      res
        .status(401)
        .json({ success: false, message: "Missing x-client-secret" });
      return;
    }

    const client = await clientRepository.findByClientIdWithSecret(providedId);
    if (!client) {
      res.status(401).json({ success: false, message: "Unknown client" });
      return;
    }

    if (client.status !== "ACTIVE") {
      res
        .status(403)
        .json({ success: false, message: `Client is ${client.status}` });
      return;
    }

    const ok = await bcrypt.compare(providedSecret, client.client_secret_hash);
    if (!ok) {
      res
        .status(401)
        .json({ success: false, message: "Invalid client credentials" });
      return;
    }

    if (
      requiredScope &&
      !client.service_scopes.includes(requiredScope)
    ) {
      res.status(403).json({
        success: false,
        message: `Client does not have scope "${requiredScope}"`,
      });
      return;
    }

    if (client.ip_allowlist && client.ip_allowlist.length > 0) {
      const ip = (req.ip || "").replace(/^::ffff:/, "");
      if (!client.ip_allowlist.includes(ip)) {
        res
          .status(403)
          .json({ success: false, message: "Source IP not allowed" });
        return;
      }
    }

    clientReq.client = client;
    void touchLastSeen(client, req.ip);
    next();
  };

  handler.__requiresClientAuth = true;
  if (requiredScope) handler.__requiredScope = requiredScope;
  return handler;
};

/** Best-effort last-seen update; never blocks the request. */
const touchLastSeen = async (client: Client, ip: string | undefined) => {
  try {
    await client.update({
      last_seen_at: new Date(),
      last_seen_ip: ip ? ip.replace(/^::ffff:/, "").slice(0, 64) : null,
    });
  } catch {
    /* swallow — observability bookkeeping must not break auth */
  }
};

/** Convenience helper for handlers that need the authenticated client. */
export const getRequestClient = (req: Request): Client | null =>
  (req as ClientRequest).client ?? null;
