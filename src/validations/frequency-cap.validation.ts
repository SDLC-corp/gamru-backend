import Joi from "joi";

const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];
const PERIODS = ["PER_DAY", "PER_WEEK", "PER_MONTH"];

export const createFrequencyCapSchema = Joi.object({
  channel: Joi.string()
    .valid(...CHANNELS)
    .required()
    .messages({
      "any.only": "Invalid channel",
      "any.required": "Channel is required",
    }),
  period: Joi.string()
    .valid(...PERIODS)
    .required()
    .messages({
      "any.only": "Invalid period",
      "any.required": "Period is required",
    }),
  limit: Joi.number().integer().min(1).required().messages({
    "number.base": "Limit must be a number",
    "any.required": "Limit is required",
  }),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updateFrequencyCapSchema = Joi.object({
  channel: Joi.string()
    .valid(...CHANNELS)
    .optional(),
  period: Joi.string()
    .valid(...PERIODS)
    .optional(),
  limit: Joi.number().integer().min(1).optional(),
});

export const frequencyCapIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
