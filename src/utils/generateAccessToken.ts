import jwt, { SignOptions } from "jsonwebtoken";
import type { AuthRole } from "../types/request.type";

/**
 * JWT payload shape (decoded on the server in auth.middleware.ts):
 *   {
 *     id:       "<user-uuid>",
 *     email:    "user@example.com",
 *     role:     "USER" | "ADMIN" | "SUPER_ADMIN",
 *     tenantId: "<tenant-uuid>" | null   // null only for SUPER_ADMIN
 *   }
 *
 * `tenantId` is the source of truth for the tenant a user belongs to.
 * It cannot change without re-issuing a token via login.
 */
export interface AccessTokenPayload {
  id: string;
  email: string;
  role: AuthRole;
  tenantId: string | null;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, options);
};
