/**
 * Registers Sequelize lifecycle hooks on a model so that EVERY query —
 * findAll, findOne, findByPk, count, update, destroy, create — is
 * automatically filtered/stamped with the active tenant id from
 * `tenantContext`.
 *
 * Usage (call once per model, right after `Model.init({...})`):
 *
 *   import { applyTenantScope } from "../../../core/tenant/tenant-scope";
 *   applyTenantScope(User);
 *
 * SUPER_ADMIN bypass: when the request runs inside
 * `tenantContext.runBypassed(...)` (or the auth middleware enters a
 * store with `tenantId: null`), the hooks skip injection so the query
 * sees every tenant's data.
 *
 * Explicit override per query: pass `tenantId: null` in the WHERE clause
 * to opt out for that one call (use sparingly — debugging / admin tools).
 */
import {
  ModelStatic,
  Model,
  FindOptions,
  CountOptions,
  UpdateOptions,
  DestroyOptions,
  WhereOptions,
} from "sequelize";
import { tenantContext } from "./tenant-context";

const TENANT_COL = "tenant_id";

function shouldSkip(where: WhereOptions | undefined): boolean {
  if (!where || typeof where !== "object") return false;
  // Explicit per-query opt-out: caller already set tenant_id in WHERE.
  return TENANT_COL in (where as Record<string, unknown>);
}

function injectTenantWhere(
  options: { where?: WhereOptions } | undefined
): void {
  if (!options) return;
  const tenantId = tenantContext.getTenantId();

  // No request context (boot, migrations, background) → never auto-inject.
  if (tenantId === undefined) return;
  // Bypass (super-admin) → never auto-inject.
  if (tenantId === null) return;
  // Caller already specified tenant_id → respect it.
  if (shouldSkip(options.where)) return;

  options.where = {
    ...(options.where as object),
    [TENANT_COL]: tenantId,
  } as WhereOptions;
}

export function applyTenantScope<M extends Model>(model: ModelStatic<M>): void {
  // --- READ paths ---
  model.addHook("beforeFind", (options: FindOptions) => {
    injectTenantWhere(options);
  });

  model.addHook("beforeCount", (options: CountOptions) => {
    injectTenantWhere(options as { where?: WhereOptions });
  });

  // --- WRITE paths ---
  model.addHook("beforeBulkUpdate", (options: UpdateOptions) => {
    injectTenantWhere(options as { where?: WhereOptions });
  });

  model.addHook("beforeBulkDestroy", (options: DestroyOptions) => {
    injectTenantWhere(options as { where?: WhereOptions });
  });

  // Stamp tenant_id on inserts.
  const stampCreate = (instance: Model) => {
    const tenantId = tenantContext.getTenantId();
    if (tenantId === undefined || tenantId === null) return;
    const current = (instance as unknown as Record<string, unknown>)[TENANT_COL];
    if (!current) {
      (instance as unknown as Record<string, unknown>)[TENANT_COL] = tenantId;
    }
  };

  model.addHook("beforeCreate", stampCreate);
  model.addHook("beforeBulkCreate", (instances: Model[]) => {
    instances.forEach(stampCreate);
  });

  // Defence-in-depth: at the very last moment before INSERT/UPDATE hits
  // the DB, refuse if tenant_id is still missing (outside bypass mode).
  model.addHook("beforeSave", (instance: Model) => {
    const tenantId = tenantContext.getTenantId();
    if (tenantId === null) return; // bypass
    const current = (instance as unknown as Record<string, unknown>)[TENANT_COL];
    if (!current && tenantId !== undefined) {
      (instance as unknown as Record<string, unknown>)[TENANT_COL] = tenantId;
    }
    // If we have no context AND no tenant_id on the row, let the DB
    // constraint (after Phase 4) reject it. Don't throw here — that
    // would break seeders and migrations that legitimately run with
    // no request context.
  });
}
