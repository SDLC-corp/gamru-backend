import Joi from "joi";

const STATUSES = ["IN_DESIGN", "SENT", "SCHEDULED", "PAUSED", "ARCHIVED"];

export const createCampaignSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Campaign name is required",
    "any.required": "Campaign name is required",
  }),
  type: Joi.string().max(80).optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  trigger: Joi.string().max(150).allow("", null).optional(),
  trigger_config: Joi.object().unknown(true).allow(null).optional(),
  segment: Joi.string().max(150).allow("", null).optional(),
  target_group: Joi.object().unknown(true).allow(null).optional(),
  start_date: Joi.date().iso().allow(null).optional(),
  end_date: Joi.date().iso().allow(null).optional(),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updateCampaignSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  type: Joi.string().max(80).optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  trigger: Joi.string().max(150).allow("", null).optional(),
  trigger_config: Joi.object().unknown(true).allow(null).optional(),
  segment: Joi.string().max(150).allow("", null).optional(),
  target_group: Joi.object().unknown(true).allow(null).optional(),
  start_date: Joi.date().iso().allow(null).optional(),
  end_date: Joi.date().iso().allow(null).optional(),
});

export const campaignIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
