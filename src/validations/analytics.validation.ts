import Joi from "joi";

const CHANNELS = ["EMAIL", "SMS", "WEB_PUSH", "ONSITE"];
const HISTORY_STATUSES = [
  "SENT",
  "DELIVERED",
  "OPEN",
  "CLICK",
  "LOGIN",
  "BOUNCED",
  "FAILED",
];

export const trackEventSchema = Joi.object({
  campaign_id: Joi.string().uuid().allow(null).optional(),
  name: Joi.string().max(150).optional(),
  player_id: Joi.string().max(150).required().messages({
    "any.required": "player_id is required",
    "string.empty": "player_id is required",
  }),
  status: Joi.string()
    .valid(...HISTORY_STATUSES)
    .required()
    .messages({ "any.only": "Invalid event status" }),
  channel: Joi.string()
    .valid(...CHANNELS)
    .required()
    .messages({ "any.only": "Invalid channel" }),
  sms_parts: Joi.number().integer().min(0).optional(),
  event_date: Joi.date().iso().optional(),
});

export const analyticsIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
