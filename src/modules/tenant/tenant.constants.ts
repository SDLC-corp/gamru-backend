/**
 * The fixed UUID for the "Default" tenant created by migration
 * 0023-seed-default-tenant.js. All pre-existing rows were backfilled to
 * this id. Used as a fallback when no other tenant context is resolvable
 * (e.g. user registration without a chosen tenant).
 */
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_TENANT_SLUG = "default";
