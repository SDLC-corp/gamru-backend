import { Router } from "express";
import {
  createFrequencyCap,
  paginateFrequencyCaps,
  getFrequencyCap,
  updateFrequencyCap,
  deleteFrequencyCap,
} from "../modules/frequency-cap/controller/frequency-cap.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createFrequencyCapSchema,
  updateFrequencyCapSchema,
  frequencyCapIdParamSchema,
} from "../validations/frequency-cap.validation";

const router = Router();

router.post(
  "/add",
  auth,
  validate(createFrequencyCapSchema),
  createFrequencyCap
);

router.get("/paginate", auth, paginateFrequencyCaps);

router.get(
  "/:id",
  auth,
  validate(frequencyCapIdParamSchema, "params"),
  getFrequencyCap
);

router.post(
  "/update-by/:id",
  auth,
  validate(frequencyCapIdParamSchema, "params"),
  validate(updateFrequencyCapSchema, "body"),
  updateFrequencyCap
);

router.delete(
  "/:id",
  auth,
  validate(frequencyCapIdParamSchema, "params"),
  deleteFrequencyCap
);

export default router;
