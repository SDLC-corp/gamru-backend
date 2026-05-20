import Joi from "joi";

const allowedActions = ["INSERT", "UPDATE", "DELETE", "LOGIN"] as const;

export const addUserLogSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    "string.guid": "User ID must be a valid UUID",
    "any.required": "User ID is required",
  }),

  action: Joi.string()
    .valid(...allowedActions)
    .required()
    .messages({
      "any.only": `Action must be one of ${allowedActions.join(", ")}`,
      "any.required": "Action is required",
    }),

  product: Joi.string().max(50).allow(null, "").optional(),

  sub_product: Joi.string().max(100).allow(null, "").optional(),

  subject: Joi.string().max(255).allow(null, "").optional(),

  details: Joi.string().allow(null, "").optional(),

  old_data: Joi.object().allow(null).optional(),

  new_data: Joi.object().allow(null).optional(),
});

export const updateUserLogSchema = Joi.object({
  action: Joi.string()
    .valid(...allowedActions)
    .optional(),

  product: Joi.string().max(50).allow(null, "").optional(),

  sub_product: Joi.string().max(100).allow(null, "").optional(),

  subject: Joi.string().max(255).allow(null, "").optional(),

  details: Joi.string().allow(null, "").optional(),

  old_data: Joi.object().allow(null).optional(),

  new_data: Joi.object().allow(null).optional(),
});

export const userLogIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

export const paginateUserLogSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),

  user_id: Joi.string().uuid().optional(),

  action: Joi.string().valid(...allowedActions).optional(),

  product: Joi.string().optional(),

  fromDate: Joi.date().optional(),

  toDate: Joi.date().optional(),
});