import Joi from "joi";

const STATUSES = ["ACTIVE", "INACTIVE"];

export const createCustomTriggerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Trigger name is required",
    "any.required": "Trigger name is required",
  }),
  trigger: Joi.string().max(150).allow("", null).optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  builder: Joi.object().unknown(true).allow(null).optional(),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updateCustomTriggerSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  trigger: Joi.string().max(150).allow("", null).optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  builder: Joi.object().unknown(true).allow(null).optional(),
});

export const customTriggerIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
