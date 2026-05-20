import { Router } from "express";
import {
  createTemplate,
  paginateTemplates,
  getTemplate,
  updateTemplate,
  archiveTemplate,
  restoreTemplate,
  deleteTemplate,
} from "../modules/template/controller/template.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdParamSchema,
} from "../validations/template.validation";

const router = Router();

router.post("/add", auth, validate(createTemplateSchema), createTemplate);

router.get("/paginate", auth, paginateTemplates);

router.get(
  "/:id",
  auth,
  validate(templateIdParamSchema, "params"),
  getTemplate
);

router.post(
  "/update-by/:id",
  auth,
  validate(templateIdParamSchema, "params"),
  validate(updateTemplateSchema, "body"),
  updateTemplate
);

router.post(
  "/archive/:id",
  auth,
  validate(templateIdParamSchema, "params"),
  archiveTemplate
);

router.post(
  "/restore/:id",
  auth,
  validate(templateIdParamSchema, "params"),
  restoreTemplate
);

router.delete(
  "/:id",
  auth,
  validate(templateIdParamSchema, "params"),
  deleteTemplate
);

export default router;
