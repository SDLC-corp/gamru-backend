import { Router } from "express";
import {
  paginateCrmTags,
  addCrmTag,
  updateCrmTag,
  deleteCrmTag,
} from "../modules/crm-tag/controller/crm-tag.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  paginateCrmTagSchema,
  addCrmTagSchema,
  updateCrmTagSchema,
  crmTagIdParamSchema,
} from "../validations/crm-tag.validation";

const router = Router();

router.get(
  "/paginate",
  auth,
  validate(paginateCrmTagSchema, "query"),
  paginateCrmTags
);

router.post(
  "/add",
  auth,
  validate(addCrmTagSchema, "body"),
  addCrmTag
);

router.post(
  "/update-by/:id",
  auth,
  validate(crmTagIdParamSchema, "params"),
  validate(updateCrmTagSchema, "body"),
  updateCrmTag
);

router.delete(
  "/:id",
  auth,
  validate(crmTagIdParamSchema, "params"),
  deleteCrmTag
);

export default router;
