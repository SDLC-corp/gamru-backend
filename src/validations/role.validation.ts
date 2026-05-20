import Joi from "joi";

export const addRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Role name is required",
    "any.required": "Role name is required",
  }),
  description: Joi.string().allow("").optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().allow("").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
});

export const roleIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});