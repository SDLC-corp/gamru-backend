import Joi from "joi";

const CATEGORIES = [
  "campaign",
  "segment",
  "template",
  "custom-trigger",
  "frequency-cap",
  "unsubscribe-report",
  "player-data",
];

export const paginateCrmTagSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  search: Joi.string().trim().allow("").optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional()
    .messages({
      "any.only": "Invalid category",
    }),
});

export const addCrmTagSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  description: Joi.string().max(500).allow("").optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required()
    .messages({
      "any.only": "Invalid category",
      "any.required": "Category is required",
    }),
});

export const updateCrmTagSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).allow("").optional(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .optional()
    .messages({
      "any.only": "Invalid category",
    }),
});

export const crmTagIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
