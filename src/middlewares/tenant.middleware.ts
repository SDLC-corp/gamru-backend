import { Request, Response, NextFunction } from "express";
import { AuthRequest, AuthRole } from "../types/request.type";
import TenantRepository from "../modules/tenant/model/tenant.repository";
import { tenantContext } from "../core/tenant/tenant-context";
import { AppError } from "../utils/AppError";

/**
 * Per-request tenant resolution + scope activation.
 *
 * Precedence:
 *   1. JWT `tenantId`  (set by auth middleware; source of truth for non-super-admin)
 *   2. `x-tenant-id`   header
 *   3. Subdomain       (company1.myapp.com → "company1")
 *
 * SUPER_ADMIN may:
 *   • run cross-tenant (no tenant in JWT, no header)  → bypass
 *   • impersonate a single tenant via the x-tenant-id header
 *
 * For non-super-admin, the JWT tenant is authoritative. A header or
 * subdomain that disagrees with the JWT results in 403 — that's an
 * attempt to access a tenant the user isn't bound to.
 *
 * After resolution this middleware WRAPS `next()` in
 * `tenantContext.run(...)` so every async DB call inside the request
 * sees the active tenant and the Sequelize hooks scope it automatically.
 */
export const resolveTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;

  try {
    const fromJwt: string | null | undefined = authReq.user?.tenantId;
    const fromHeader = (req.headers["x-tenant-id"] as string | undefined)?.trim() || undefined;
    const fromSub = extractSubdomain(req.hostname);

    const role: AuthRole | undefined = authReq.user?.role;

    // ─── SUPER_ADMIN ─────────────────────────────────────────────
    if (role === "SUPER_ADMIN") {
      if (fromHeader) {
        const t = await TenantRepository.findActiveById(fromHeader);
        if (!t) return next(new AppError("Tenant not found or suspended", 404));
        authReq.tenant = t;
        authReq.tenantId = t.id;
        return tenantContext.run(
          { tenantId: t.id, userId: authReq.user?.id, role },
          () => next()
        );
      }
      // No explicit tenant pick → cross-tenant (bypass).
      authReq.tenantId = null;
      return tenantContext.run(
        { tenantId: null, userId: authReq.user?.id, role: "SUPER_ADMIN" },
        () => next()
      );
    }

    // ─── ORDINARY USER (must have JWT tenant) ────────────────────
    if (!fromJwt) {
      return next(new AppError("Tenant context missing in token", 401));
    }

    // Header must match JWT — never let a header override a user's bound tenant.
    if (fromHeader && fromHeader !== fromJwt) {
      return next(new AppError("Tenant mismatch (header vs token)", 403));
    }

    // Subdomain must match too if present.
    if (fromSub) {
      const subTenant = await TenantRepository.findActiveBySubdomain(fromSub);
      if (subTenant && subTenant.id !== fromJwt) {
        return next(new AppError("Tenant mismatch (subdomain vs token)", 403));
      }
    }

    const tenant = await TenantRepository.findActiveById(fromJwt);
    if (!tenant) {
      return next(new AppError("Tenant not found or suspended", 403));
    }

    authReq.tenant = tenant;
    authReq.tenantId = tenant.id;

    // Enter the request-scoped context so Sequelize hooks auto-filter.
    tenantContext.run(
      { tenantId: tenant.id, userId: authReq.user?.id, role },
      () => next()
    );
  } catch (e) {
    next(e);
  }
};

/**
 * Public-route variant: resolves tenant from subdomain or header ONLY
 * (no JWT required). Used by /auth/login and /auth/register so the
 * uniqueness lookup ("email already exists *in this tenant*") is
 * scoped correctly. If no tenant hint is found, the context is left
 * un-set and the auth service falls back to DEFAULT_TENANT_ID.
 */
export const resolveTenantPublic = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const fromHeader = (req.headers["x-tenant-id"] as string | undefined)?.trim() || undefined;
    const fromSub = extractSubdomain(req.hostname);

    let resolvedId: string | undefined;

    if (fromHeader) {
      const t = await TenantRepository.findActiveById(fromHeader);
      if (t) resolvedId = t.id;
    }
    if (!resolvedId && fromSub) {
      const t = await TenantRepository.findActiveBySubdomain(fromSub);
      if (t) resolvedId = t.id;
    }

    if (resolvedId) {
      authReq.tenantId = resolvedId;
      return tenantContext.run({ tenantId: resolvedId, role: "USER" }, () => next());
    }
    // No tenant resolved — let the service decide (defaults to DEFAULT_TENANT_ID).
    next();
  } catch (e) {
    next(e);
  }
};

function extractSubdomain(hostname: string): string | null {
  if (!hostname || hostname === "localhost") return null;
  const parts = hostname.split(".");
  if (parts.length < 3) return null; // myapp.com → no subdomain
  if (parts[0] === "www" || parts[0] === "api") return null;
  return parts[0];
}
