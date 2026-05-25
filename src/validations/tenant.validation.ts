import Joi from "joi";

const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export const createTenantSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Tenant name is required",
    "any.required": "Tenant name is required",
  }),
  slug: Joi.string().pattern(slugRegex).max(80).required().messages({
    "string.pattern.base":
      "Slug must be lowercase letters, digits and hyphens (no leading/trailing hyphen)",
    "any.required": "Slug is required",
  }),
  subdomain: Joi.string().pattern(slugRegex).max(80).optional().allow(null, ""),
  plan: Joi.string().max(50).optional(),
  status: Joi.string().valid("ACTIVE", "SUSPENDED", "DELETED").optional(),
  settings: Joi.object().optional(),
});

export const updateTenantSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  slug: Joi.string().pattern(slugRegex).max(80).optional(),
  subdomain: Joi.string().pattern(slugRegex).max(80).optional().allow(null, ""),
  plan: Joi.string().max(50).optional(),
  status: Joi.string().valid("ACTIVE", "SUSPENDED", "DELETED").optional(),
  settings: Joi.object().optional(),
}).min(1);

export const tenantIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "Tenant id must be a valid UUID",
    "any.required": "Tenant id is required",
  }),
});
