import { Router } from "express";
import {
  paginateMedia,
  addMedia,
  deleteMedia,
} from "../modules/media-database/controller/media-database.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { uploadImageSafe } from "../middlewares/upload.middleware";
import {
  paginateMediaSchema,
  addMediaSchema,
  mediaIdParamSchema,
} from "../validations/media-database.validation";

const router = Router();

router.get(
  "/paginate",
  auth,
  validate(paginateMediaSchema, "query"),
  paginateMedia
);

router.post(
  "/add",
  auth,
  uploadImageSafe,
  validate(addMediaSchema, "body"),
  addMedia
);

router.delete(
  "/:id",
  auth,
  validate(mediaIdParamSchema, "params"),
  deleteMedia
);

export default router;
