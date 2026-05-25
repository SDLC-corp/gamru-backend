import "express";
import type { Tenant } from "../modules/tenant/model/tenant.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN" | "SUPER_ADMIN";
        /** Tenant the user is bound to. `null` is only valid for SUPER_ADMIN. */
        tenantId: string | null;
      };
      /** Full tenant record, set by resolveTenant middleware. */
      tenant?: Tenant;
      /**
       * Effective tenant id for this request.
       *   • string     → ordinary tenant-scoped request
       *   • null       → SUPER_ADMIN cross-tenant
       *   • undefined  → unauthenticated route with no tenant hint
       */
      tenantId?: string | null;
    }
  }
}

export {};
