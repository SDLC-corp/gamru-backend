import { Router } from "express";
import {
  getCampaignAnalytics,
  getCampaignAnalyticsDetail,
  getHistory,
  trackEvent,
} from "../modules/analytics/controller/analytics.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  trackEventSchema,
  analyticsIdParamSchema,
} from "../validations/analytics.validation";

const router = Router();

router.get("/campaigns", auth, getCampaignAnalytics);

router.get(
  "/campaigns/:id",
  auth,
  validate(analyticsIdParamSchema, "params"),
  getCampaignAnalyticsDetail
);

router.get("/history", auth, getHistory);

router.post("/track", auth, validate(trackEventSchema), trackEvent);

export default router;
