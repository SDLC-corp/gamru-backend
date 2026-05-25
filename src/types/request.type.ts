import { Request } from "express";
import type { Tenant } from "../modules/tenant/model/tenant.model";

export type AuthRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: AuthRole;
    /** Tenant the user is bound to. `null` is only valid for SUPER_ADMIN. */
    tenantId: string | null;
  };
  /** Resolved tenant record for the current request (set by resolveTenant middleware). */
  tenant?: Tenant;
  /**
   * Convenience accessor for the effective tenant id of this request.
   *   • string  → ordinary tenant-scoped request
   *   • null    → SUPER_ADMIN running cross-tenant
   *   • undefined → unauthenticated (public) route
   */
  tenantId?: string | null;
}
