import { Router } from "express";
import {
  getUsers,
  me,
  paginateUsers,
  deleteUser,
  updateUser,
  addUser,
  updateMe,
  changePassword,
} from "../modules/user/controller/user.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  addOrUpdateUserSchema,
  paginateSchema,
  uuidParamSchema,
  updateMeSchema,
  changePasswordSchema,
} from "../validations/user.validation";

const router = Router();

router.post("/add", validate(addOrUpdateUserSchema), addUser);

router.post(
  "/update-by/:id",
  auth,
  role("ADMIN"),
  validate(uuidParamSchema, "params"),
  updateUser
);

router.get("/me", auth, me);

router.patch("/me", auth, validate(updateMeSchema), updateMe);

router.post(
  "/me/change-password",
  auth,
  validate(changePasswordSchema),
  changePassword
);

router.get("/", auth, role("ADMIN"), getUsers);

router.get(
  "/paginate",
  auth,
  role("ADMIN"),
  validate(paginateSchema, "query"),
  paginateUsers
);

router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  validate(uuidParamSchema, "params"),
  deleteUser
);

export default router;
