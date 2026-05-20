import { Router } from "express";
import {
  addRole,
  getRoles,
  paginateRoles,
  deleteRole,
  updateRole,
} from "../modules/role/controller/role.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { uuidParamSchema, paginateSchema } from "../validations/user.validation";
import { addRoleSchema, roleIdParamSchema, updateRoleSchema } from "../validations/role.validation";

const router = Router();

router.post("/add", auth, role("ADMIN"), validate(addRoleSchema), addRole);

router.get("/", auth, role("ADMIN"), getRoles);

router.get(
  "/paginate",
  auth,
  role("ADMIN"),
  validate(paginateSchema, "query"),
  paginateRoles
);

router.post(
  "/update-by/:id",
  auth,
  role("ADMIN"),
  validate(roleIdParamSchema, "params"),
  validate(updateRoleSchema, "body"),
  updateRole
);

router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  validate(roleIdParamSchema, "params"),
  deleteRole
);

export default router;
