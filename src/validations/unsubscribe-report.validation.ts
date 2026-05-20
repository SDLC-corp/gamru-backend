import Joi from "joi";

const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];

export const createUnsubscribeReportSchema = Joi.object({
  player_id: Joi.string().max(150).required().messages({
    "string.empty": "Player ID is required",
    "any.required": "Player ID is required",
  }),
  campaign_name: Joi.string().max(200).allow("", null).optional(),
  channel: Joi.string()
    .valid(...CHANNELS)
    .required()
    .messages({
      "any.only": "Invalid channel",
      "any.required": "Channel is required",
    }),
  reason: Joi.string().allow("", null).optional(),
  unsubscribed_at: Joi.date().iso().optional(),
});
