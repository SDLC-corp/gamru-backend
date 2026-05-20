import Joi from "joi";

const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];

export const createTemplateSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Template name is required",
    "any.required": "Template name is required",
  }),
  channel: Joi.string()
    .valid(...CHANNELS)
    .required()
    .messages({
      "any.only": "Invalid template channel",
      "any.required": "Template channel is required",
    }),
  description: Joi.string().allow("", null).optional(),
  language: Joi.string().max(50).allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  subject: Joi.string().max(255).allow("", null).optional(),
  content: Joi.string().allow("", null).optional(),
  test_recipients: Joi.array().items(Joi.string()).allow(null).optional(),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updateTemplateSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  channel: Joi.string()
    .valid(...CHANNELS)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  language: Joi.string().max(50).allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  subject: Joi.string().max(255).allow("", null).optional(),
  content: Joi.string().allow("", null).optional(),
  test_recipients: Joi.array().items(Joi.string()).allow(null).optional(),
});

export const templateIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
