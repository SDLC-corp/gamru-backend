import { Router } from "express";
import {
  addLog,
  getLogs,
  getLogById,
  paginateLogs,
  updateLog,
  deleteLog,
} from "../modules/user-log/controller/user-log.controller";

import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  addUserLogSchema,
  updateUserLogSchema,
  userLogIdParamSchema,
} from "../validations/user-log.validation";

const router = Router();

router.post("/add", auth, validate(addUserLogSchema), addLog);

router.get("/", auth, role("ADMIN"), getLogs);

router.get("/paginate", auth, role("ADMIN"), paginateLogs);

router.get(
  "/:id",
  auth,
  role("ADMIN"),
  validate(userLogIdParamSchema, "params"),
  getLogById
);

router.post(
  "/update-by/:id",
  auth,
  role("ADMIN"),
  validate(userLogIdParamSchema, "params"),
  validate(updateUserLogSchema),
  updateLog
);

router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  validate(userLogIdParamSchema, "params"),
  deleteLog
);

export default router;
