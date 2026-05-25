import Joi from "joi";

const slugPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(120).required().messages({
    "string.empty": "Client name is required",
    "any.required": "Client name is required",
  }),
  slug: Joi.string()
    .pattern(slugPattern)
    .min(2)
    .max(120)
    .optional()
    .messages({
      "string.pattern.base":
        "Slug may only contain lowercase letters, digits and hyphens",
    }),
  skin_id: Joi.string().min(2).max(40).optional(),
  description: Joi.string().allow("", null).max(500).optional(),
  contact_email: Joi.string().email().allow("", null).optional(),
  contact_phone: Joi.string().allow("", null).max(40).optional(),
  webhook_url: Joi.string().uri().allow("", null).optional(),
  timezone: Joi.string().max(60).optional(),
  meta: Joi.object().unknown(true).allow(null).optional(),
    status: Joi.string().valid("ENABLED", "DISABLED").optional(),

});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  slug: Joi.string()
    .pattern(slugPattern)
    .min(2)
    .max(120)
    .optional(),
  skin_id: Joi.string().min(2).max(40).optional(),
  description: Joi.string().allow("", null).max(500).optional(),
  contact_email: Joi.string().email().allow("", null).optional(),
  contact_phone: Joi.string().allow("", null).max(40).optional(),
  webhook_url: Joi.string().uri().allow("", null).optional(),
  timezone: Joi.string().max(60).optional(),
  meta: Joi.object().unknown(true).allow(null).optional(),
  status: Joi.string().valid("ENABLED", "DISABLED").optional(),
}).min(1);

export const clientIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

export const listClientsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow("").max(120).optional(),
  status: Joi.string().valid("ENABLED", "DISABLED").optional(),
});
