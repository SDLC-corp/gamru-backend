import { Request, Response, NextFunction, RequestHandler } from "express";
import { auth } from "./auth.middleware";
import { clientAuth } from "./clientAuth.middleware";

interface AnnotatedFlexAuth extends RequestHandler {
  __requiresAuth?: true;
  __requiresClientKey?: true;
}

/**
 * Accept EITHER an admin JWT (`Authorization: Bearer …`) OR an external
 * client's per-tenant API key (`x-client-auth-key`). Used on endpoints
 * that are legitimately consumed by both the gamru admin UI (logged-in
 * operator → JWT) and a downstream service backend (e.g. a games
 * platform → client_auth_key).
 *
 *   - has x-client-auth-key → delegate to `clientAuth`
 *   - has Authorization Bearer → delegate to `auth`
 *   - neither              → 401 with a clear message
 *
 * After success the relevant `req.user` and/or `req.client` is
 * populated by the underlying middleware exactly as if it had been
 * used directly.
 */
export const flexAuth: AnnotatedFlexAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientKey = req.header("x-client-auth-key");
  const authHeader = req.header("authorization");

  if (clientKey) {
    clientAuth(req, res, next);
    return;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    auth(req, res, next);
    return;
  }

  res.status(401).json({
    success: false,
    message:
      "Unauthorized — provide either x-client-auth-key (service caller) or Authorization: Bearer <token> (admin user)",
  });
};

flexAuth.__requiresAuth = true;
flexAuth.__requiresClientKey = true;
