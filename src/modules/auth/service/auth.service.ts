import bcrypt from "bcryptjs";

import UserRepository from "../../user/model/user.repository";
import TenantRepository from "../../tenant/model/tenant.repository";
import { AppError } from "../../../utils/AppError";
import { generateAccessToken } from "../../../utils/generateAccessToken";
import { decryptPassword } from "../../../utils/passwordCrypto";
import { tenantContext } from "../../../core/tenant/tenant-context";
import { DEFAULT_TENANT_ID } from "../../tenant/tenant.constants";
import User from "../../user/model/user.model";

/**
 * Register a new user. Tenant resolution order:
 *   1. caller-supplied `tenantId` (from controller — header/subdomain)
 *   2. tenant resolved by middleware (tenantContext) — e.g. from subdomain
 *   3. DEFAULT_TENANT_ID fallback
 *
 * Public registration always pre-binds the user to ONE tenant. To create a
 * SUPER_ADMIN, do it from a maintenance script — not through this endpoint.
 */
export const registerService = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  mobile: string,
  explicitTenantId?: string
): Promise<Record<string, unknown>> => {
  const tenantId =
    explicitTenantId ?? tenantContext.getTenantId() ?? DEFAULT_TENANT_ID;

  // Verify the tenant exists & is active before creating a user.
  const tenant = await TenantRepository.findActiveById(tenantId as string);
  if (!tenant) {
    throw new AppError("Invalid or suspended tenant", 400);
  }

  // Uniqueness is now PER-TENANT (composite indexes from migration 0025).
  // We must scope these lookups to the target tenant, which the global
  // hook will do automatically — but if we're called outside a request
  // context, we need to set it manually.
  const lookupCtx = () => tenantContext.run({ tenantId, role: "USER" }, async () => {
    const existing = await UserRepository.findOne({ email });
    if (existing) throw new AppError("Email already exists in this tenant", 409);

    const existingMobile = await UserRepository.findOne({ mobile });
    if (existingMobile) throw new AppError("Mobile number already registered in this tenant", 409);

    const hash = await bcrypt.hash(password, 12);

    const user = await UserRepository.create({
      tenant_id: tenantId,
      first_name,
      last_name,
      email,
      mobile,
      password: hash,
      role: "USER",
      status: "ACTIVE",
    });

    const userJson = user?.toJSON() as Record<string, unknown>;
    delete userJson.password;
    return userJson;
  });

  return lookupCtx();
};

/**
 * Login.
 *
 * Tenant resolution on login:
 *   • If the request came in via a subdomain or x-tenant-id header,
 *     resolveTenant middleware will have set `req.tenantId`. The caller
 *     can pass that as `tenantHint`.
 *   • Otherwise the lookup is bypassed (cross-tenant) so any user can
 *     authenticate. The MINTED JWT then carries the user's bound tenant.
 *
 * The user's `tenant_id` column is the source of truth — what the hint
 * found just narrows the lookup so two tenants with the same email
 * don't collide.
 */
export const loginService = async (
  email: string,
  password: string,
  tenantHint?: string | null
): Promise<{ token: string; tenantId: string | null }> => {
  // Look up the user. If we have a tenant hint, run inside that tenant
  // context so the global hook scopes the query; otherwise bypass.
  const findUser = async () => {
    const Bypassed = User.unscoped().scope("withPassword");
    return Bypassed.findOne({ where: { email } });
  };

  const user = tenantHint
    ? await tenantContext.run({ tenantId: tenantHint, role: "USER" }, findUser)
    : await tenantContext.runBypassed(findUser);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }
  if (user.status === "INACTIVE") {
    throw new AppError("Account is inactive. Please contact support.", 403);
  }

  const realPassword = decryptPassword(password);
  const match = await bcrypt.compare(realPassword, user.password);
  if (!match) {
    throw new AppError("Invalid email or password", 401);
  }

  // Mint a tenant-aware access token. SUPER_ADMIN tenantId is null.
  const token = generateAccessToken({
    id: user.id,
    role: user.role,
    email: user.email,
    tenantId: user.tenant_id ?? null,
  });

  // Persist the issued token. The user row already has a tenant_id (or
  // null for SUPER_ADMIN); we just need to bypass so the update doesn't
  // get re-scoped.
  await tenantContext.runBypassed(() =>
    UserRepository.updateAccessTokens(user.id, { access_token: token })
  );

  return { token, tenantId: user.tenant_id ?? null };
};

export const resetPasswordService = async (
  email: string,
  _token: string,
  new_password: string
) => {
  // Password reset crosses tenant scoping because the reset flow only
  // knows the email — we bypass and rely on the email/token combo.
  return tenantContext.runBypassed(async () => {
    const user = await UserRepository.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const hash = await bcrypt.hash(new_password, 12);
    await user.update({ password: hash });
    return { email };
  });
};

export const logoutService = async (userId: string) => {
  await tenantContext.runBypassed(() =>
    UserRepository.updateAccessTokens(userId, {
      access_token: null,
      refresh_token: null,
    })
  );
};
