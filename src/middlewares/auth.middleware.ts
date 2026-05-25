import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, AuthRole } from "../types/request.type";
import { resolveTenant } from "./tenant.middleware";

interface AnnotatedAuth extends RequestHandler {
  __requiresAuth?: true;
}

/**
 * Authenticated request gate. Does two things in sequence:
 *
 *   1. Verify the JWT bearer token. Populates `req.user` with
 *      `{ id, email, role, tenantId }`.
 *   2. Hand off to `resolveTenant`, which validates the tenant id
 *      (against subdomain/header), loads the tenant row, and enters
 *      the AsyncLocalStorage context so every downstream Sequelize
 *      query is automatically filtered by tenant_id.
 *
 * Routes only need to chain `auth` once — tenant scoping comes for free.
 */
export const auth: AnnotatedAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as {
      id: string;
      email: string;
      role: AuthRole;
      tenantId: string | null;
    };

    const authReq = req as AuthRequest;
    authReq.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId ?? null,
    };
    authReq.tenantId = decoded.tenantId ?? null;

    // Chain into tenant resolution. resolveTenant handles errors via next(err).
    resolveTenant(req, res, next);
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

auth.__requiresAuth = true;
