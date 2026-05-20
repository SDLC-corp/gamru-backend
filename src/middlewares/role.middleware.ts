import { Response, NextFunction, RequestHandler } from "express";
import { AuthRequest } from "../types/request.type";

interface AnnotatedRoleGuard extends RequestHandler {
  __requiredRoles?: string[];
}

export const role = (...roles: string[]): AnnotatedRoleGuard => {
  const handler: AnnotatedRoleGuard = (
    req,
    res: Response,
    next: NextFunction
  ): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res
        .status(403)
        .json({ success: false, message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  };

  handler.__requiredRoles = roles;
  return handler;
};
