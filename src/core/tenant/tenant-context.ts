/**
 * Per-request tenant context, propagated through async calls using
 * Node's AsyncLocalStorage. Set once by the tenant middleware at the
 * top of the request; read by Sequelize hooks (see ./tenant-scope.ts)
 * and by any service that needs the active tenant id without having
 * to thread `req` everywhere.
 *
 * Three possible states:
 *   • store === undefined        → no request context (background job, boot)
 *   • store.tenantId === null    → SUPER_ADMIN cross-tenant request (bypass)
 *   • store.tenantId === <uuid>  → ordinary tenant-scoped request
 */
import { AsyncLocalStorage } from "node:async_hooks";

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface TenantStore {
  tenantId: string | null; // null = bypass (super-admin)
  userId?: string;
  role?: Role;
}

const storage = new AsyncLocalStorage<TenantStore>();

export const tenantContext = {
  /** Run `fn` inside a request-scoped context. */
  run<T>(store: TenantStore, fn: () => T): T {
    return storage.run(store, fn);
  },

  /** Current store, or undefined if not in a request. */
  getStore(): TenantStore | undefined {
    return storage.getStore();
  },

  /** Current tenant id. `undefined` means "no context", `null` means "bypass". */
  getTenantId(): string | null | undefined {
    return storage.getStore()?.tenantId;
  },

  /** True if the current request explicitly bypasses tenant filtering. */
  isBypassed(): boolean {
    const s = storage.getStore();
    return !!s && s.tenantId === null;
  },

  /**
   * Run `fn` with tenant filtering disabled. Use for super-admin operations
   * or for one-shot maintenance code. NEVER call from request handlers
   * unless the caller is a SUPER_ADMIN.
   */
  runBypassed<T>(fn: () => T): T {
    return storage.run({ tenantId: null, role: "SUPER_ADMIN" }, fn);
  },
};
