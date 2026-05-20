import { Router } from "express";
import {
  createSegment,
  paginateSegments,
  getSegment,
  getSegmentCreators,
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

router.get("/:id", auth, validate(segmentIdParamSchema, "params"), getSegment);

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
