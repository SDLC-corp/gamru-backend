import { Router } from "express";
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  suspendTenant,
  reactivateTenant,
} from "../modules/tenant/controller/tenant.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createTenantSchema,
  updateTenantSchema,
  tenantIdParamSchema,
} from "../validations/tenant.validation";

/**
 * Tenant CRUD — SUPER_ADMIN only.
 *
 * The `auth` middleware verifies the JWT AND resolves the tenant
 * context. For SUPER_ADMIN, resolveTenant leaves the request in
 * "bypass" mode (no auto-scoping), so these endpoints see and mutate
 * any tenant.
 */
const router = Router();
const onlySuperAdmin = role("SUPER_ADMIN");

router.get("/", auth, onlySuperAdmin, listTenants);

router.get(
  "/:id",
  auth,
  onlySuperAdmin,
  validate(tenantIdParamSchema, "params"),
  getTenant
);

router.post(
  "/",
  auth,
  onlySuperAdmin,
  validate(createTenantSchema, "body"),
  createTenant
);

router.patch(
  "/:id",
  auth,
  onlySuperAdmin,
  validate(tenantIdParamSchema, "params"),
  validate(updateTenantSchema, "body"),
  updateTenant
);

router.post(
  "/:id/suspend",
  auth,
  onlySuperAdmin,
  validate(tenantIdParamSchema, "params"),
  suspendTenant
);

router.post(
  "/:id/reactivate",
  auth,
  onlySuperAdmin,
  validate(tenantIdParamSchema, "params"),
  reactivateTenant
);

export default router;
