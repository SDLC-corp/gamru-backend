/**
 * Sugar on top of BaseRepository for repositories that conceptually
 * belong to a tenant. With the global `applyTenantScope(Model)` hooks
 * already filtering every query automatically, this class doesn't have
 * to do anything magical — it's a marker that documents intent and
 * exposes a couple of helpers for the explicit cases.
 *
 *   class SegmentRepository extends TenantScopedRepository<Segment> {}
 *
 * Use `bypass()` for the rare case where a SUPER_ADMIN service needs
 * to read across tenants from inside an otherwise-scoped request.
 */
import { Model, ModelStatic } from "sequelize";
import { BaseRepository } from "./base.repository";
import { tenantContext } from "../tenant/tenant-context";

export class TenantScopedRepository<T extends Model> extends BaseRepository<T> {
  constructor(model: ModelStatic<T>) {
    super(model);
  }

  /** Run a callback with tenant filtering disabled. SUPER_ADMIN only. */
  protected bypass<R>(fn: () => Promise<R>): Promise<R> {
    return tenantContext.runBypassed(fn);
  }

  /** Current tenant id from request context, or null for bypass / undefined when out-of-request. */
  protected currentTenantId(): string | null | undefined {
    return tenantContext.getTenantId();
  }
}
