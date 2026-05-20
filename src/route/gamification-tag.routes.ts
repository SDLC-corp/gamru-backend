import { Router } from "express";
import {
  paginateGamificationTags,
  addGamificationTag,
  updateGamificationTag,
  deleteGamificationTag,
} from "../modules/gamification-tag/controller/gamification-tag.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  paginateGamificationTagSchema,
  addGamificationTagSchema,
  updateGamificationTagSchema,
  gamificationTagIdParamSchema,
} from "../validations/gamification-tag.validation";

const router = Router();

router.get(
  "/paginate",
  auth,
  validate(paginateGamificationTagSchema, "query"),
  paginateGamificationTags
);

router.post(
  "/add",
  auth,
  validate(addGamificationTagSchema, "body"),
  addGamificationTag
);

router.post(
  "/update-by/:id",
  auth,
  validate(gamificationTagIdParamSchema, "params"),
  validate(updateGamificationTagSchema, "body"),
  updateGamificationTag
);

router.delete(
  "/:id",
  auth,
  validate(gamificationTagIdParamSchema, "params"),
  deleteGamificationTag
);

export default router;
