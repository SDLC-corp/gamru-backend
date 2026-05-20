import { Router } from "express";
import {
  createCustomTrigger,
  paginateCustomTriggers,
  getCustomTrigger,
  updateCustomTrigger,
  archiveCustomTrigger,
  restoreCustomTrigger,
  deleteCustomTrigger,
} from "../modules/custom-trigger/controller/custom-trigger.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCustomTriggerSchema,
  updateCustomTriggerSchema,
  customTriggerIdParamSchema,
} from "../validations/custom-trigger.validation";

const router = Router();

router.post(
  "/add",
  auth,
  validate(createCustomTriggerSchema),
  createCustomTrigger
);

router.get("/paginate", auth, paginateCustomTriggers);

router.get(
  "/:id",
  auth,
  validate(customTriggerIdParamSchema, "params"),
  getCustomTrigger
);

router.post(
  "/update-by/:id",
  auth,
  validate(customTriggerIdParamSchema, "params"),
  validate(updateCustomTriggerSchema, "body"),
  updateCustomTrigger
);

router.post(
  "/archive/:id",
  auth,
  validate(customTriggerIdParamSchema, "params"),
  archiveCustomTrigger
);

router.post(
  "/restore/:id",
  auth,
  validate(customTriggerIdParamSchema, "params"),
  restoreCustomTrigger
);

router.delete(
  "/:id",
  auth,
  validate(customTriggerIdParamSchema, "params"),
  deleteCustomTrigger
);

export default router;
