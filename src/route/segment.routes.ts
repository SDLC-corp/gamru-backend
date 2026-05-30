import { Router } from "express";
import {
  createSegment,
  paginateSegments,
  getSegment,
  getSegmentCreators,
  getSegmentFields,
  getSegmentTags,
  getSegmentPlayers,
  previewSegment,
  updateSegment,
  archiveSegment,
  restoreSegment,
  deleteSegment,
} from "../modules/segment/controller/segment.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createSegmentSchema,
  updateSegmentSchema,
  segmentIdParamSchema,
} from "../validations/segment.validation";

const router = Router();

router.post("/add", auth, validate(createSegmentSchema), createSegment);

router.get("/paginate", auth, paginateSegments);

router.get("/creators", auth, getSegmentCreators);

router.get("/fields", auth, getSegmentFields);

router.get("/tags", auth, getSegmentTags);

router.post("/preview", auth, previewSegment);

router.get("/:id", auth, validate(segmentIdParamSchema, "params"), getSegment);

router.get(
  "/:id/players",
  auth,
  validate(segmentIdParamSchema, "params"),
  getSegmentPlayers
);

router.post(
  "/update-by/:id",
  auth,
  validate(segmentIdParamSchema, "params"),
  validate(updateSegmentSchema, "body"),
  updateSegment
);

router.post(
  "/archive/:id",
  auth,
  validate(segmentIdParamSchema, "params"),
  archiveSegment
);

router.post(
  "/restore/:id",
  auth,
  validate(segmentIdParamSchema, "params"),
  restoreSegment
);

router.delete(
  "/:id",
  auth,
  validate(segmentIdParamSchema, "params"),
  deleteSegment
);

export default router;
