import Joi from "joi";

const CATEGORIES = [
  "banners",
  "booster-images",
  "email-templates-assets",
  "joy-saha",
  "mission-bundles",
  "mission-banner",
  "template",
];

export const paginateMediaSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(25).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  search: Joi.string().trim().allow("").optional(),
  category: Joi.string()
    .valid("all", ...CATEGORIES)
    .optional()
    .messages({
      "any.only": "Invalid category",
    }),
});

export const addMediaSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "File name is required",
    "any.required": "File name is required",
  }),
  description: Joi.string().max(500).allow("").optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({
      "any.only": "Invalid folder",
      "any.required": "Folder is required",
    }),
  // Sent by the client but ignored server-side (derived from auth user).
  createdBy: Joi.string().allow("").optional(),
}).unknown(true);

export const mediaIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
