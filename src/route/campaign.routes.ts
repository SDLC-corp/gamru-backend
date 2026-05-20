import { Router } from "express";
import {
  createCampaign,
  paginateCampaigns,
  getCampaign,
  updateCampaign,
  archiveCampaign,
  restoreCampaign,
  deleteCampaign,
} from "../modules/campaign/controller/campaign.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdParamSchema,
} from "../validations/campaign.validation";

const router = Router();

router.post("/add", auth, validate(createCampaignSchema), createCampaign);

router.get("/paginate", auth, paginateCampaigns);

router.get(
  "/:id",
  auth,
  validate(campaignIdParamSchema, "params"),
  getCampaign
);

router.post(
  "/update-by/:id",
  auth,
  validate(campaignIdParamSchema, "params"),
  validate(updateCampaignSchema, "body"),
  updateCampaign
);

router.post(
  "/archive/:id",
  auth,
  validate(campaignIdParamSchema, "params"),
  archiveCampaign
);

router.post(
  "/restore/:id",
  auth,
  validate(campaignIdParamSchema, "params"),
  restoreCampaign
);

router.delete(
  "/:id",
  auth,
  validate(campaignIdParamSchema, "params"),
  deleteCampaign
);

export default router;
