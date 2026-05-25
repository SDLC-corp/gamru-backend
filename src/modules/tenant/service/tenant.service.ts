import { Op } from "sequelize";
import Tenant, { TenantStatus } from "../model/tenant.model";
import TenantRepository from "../model/tenant.repository";
import { AppError } from "../../../utils/AppError";
import { DEFAULT_TENANT_ID } from "../tenant.constants";

export interface CreateTenantInput {
  name: string;
  slug: string;
  subdomain?: string | null;
  plan?: string;
  status?: TenantStatus;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  subdomain?: string | null;
  plan?: string;
  status?: TenantStatus;
  settings?: Record<string, unknown>;
}

/**
 * Tenants table is not tenant-scoped itself (it IS the tenant directory),
 * so no `applyTenantScope` hook fires — these services run as plain
 * CRUD against the `tenants` table. Access must already be gated to
 * SUPER_ADMIN at the route layer.
 */

export const listTenantsService = async (
  page = 1,
  limit = 20,
  search?: string,
  status?: TenantStatus
) => {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    const like = { [Op.iLike]: `%${search}%` };
    where[Op.or as unknown as string] = [{ name: like }, { slug: like }, { subdomain: like }];
  }
  return TenantRepository.paginate(page, limit, where);
};

export const getTenantService = async (id: string): Promise<Tenant> => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw new AppError("Tenant not found", 404);
  return tenant;
};

export const createTenantService = async (
  input: CreateTenantInput
): Promise<Tenant> => {
  // Pre-check uniqueness for clearer errors (DB also enforces unique on slug + subdomain).
  const existingSlug = await Tenant.findOne({ where: { slug: input.slug } });
  if (existingSlug) throw new AppError("Slug already in use", 409);

  if (input.subdomain) {
    const existingSub = await Tenant.findOne({ where: { subdomain: input.subdomain } });
    if (existingSub) throw new AppError("Subdomain already in use", 409);
  }

  return Tenant.create({
    name: input.name,
    slug: input.slug,
    subdomain: input.subdomain ?? null,
    plan: input.plan ?? "STANDARD",
    status: input.status ?? "ACTIVE",
    settings: input.settings ?? {},
  });
};

export const updateTenantService = async (
  id: string,
  input: UpdateTenantInput
): Promise<Tenant> => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw new AppError("Tenant not found", 404);

  // Defend against renaming the seeded "default" tenant — keeps the
  // backfill-fallback invariant of 0023-seed-default-tenant.js intact.
  if (id === DEFAULT_TENANT_ID && input.slug && input.slug !== "default") {
    throw new AppError("The default tenant slug cannot be changed", 400);
  }

  if (input.slug && input.slug !== tenant.slug) {
    const existingSlug = await Tenant.findOne({
      where: { slug: input.slug, id: { [Op.ne]: id } },
    });
    if (existingSlug) throw new AppError("Slug already in use", 409);
  }
  if (input.subdomain && input.subdomain !== tenant.subdomain) {
    const existingSub = await Tenant.findOne({
      where: { subdomain: input.subdomain, id: { [Op.ne]: id } },
    });
    if (existingSub) throw new AppError("Subdomain already in use", 409);
  }

  await tenant.update(input);
  return tenant;
};

/**
 * "Delete" = soft delete by marking the tenant SUSPENDED, so existing
 * data is preserved and the resolveTenant middleware rejects new
 * requests. Hard delete would require deleting all tenant-scoped rows
 * across 40+ tables — out of scope for a CRUD endpoint.
 */
export const suspendTenantService = async (id: string): Promise<Tenant> => {
  if (id === DEFAULT_TENANT_ID) {
    throw new AppError("The default tenant cannot be suspended", 400);
  }
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw new AppError("Tenant not found", 404);
  await tenant.update({ status: "SUSPENDED" });
  return tenant;
};

export const reactivateTenantService = async (id: string): Promise<Tenant> => {
  const tenant = await Tenant.findByPk(id);
  if (!tenant) throw new AppError("Tenant not found", 404);
  await tenant.update({ status: "ACTIVE" });
  return tenant;
};
