import Joi from "joi";

const TYPES = ["STRING", "BOOLEAN", "NUMBER", "DATE"];

const baseFields = {
  name: Joi.string().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  description: Joi.string().allow("", null).optional(),
  data_type: Joi.string()
    .valid(...TYPES)
    .required()
    .messages({
      "any.only": "Invalid data type",
      "any.required": "Data type is required",
    }),
  data_option: Joi.string().max(255).allow("", null).optional(),
};

export const createPlayerDataSchema = Joi.object({
  ...baseFields,
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const bulkCreatePlayerDataSchema = Joi.object({
  rows: Joi.array()
    .items(Joi.object(baseFields))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one row is required",
      "any.required": "Rows are required",
    }),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updatePlayerDataSchema = Joi.object({
  name: Joi.string().min(1).max(150).optional(),
  description: Joi.string().allow("", null).optional(),
  data_type: Joi.string()
    .valid(...TYPES)
    .optional(),
  data_option: Joi.string().max(255).allow("", null).optional(),
});

export const playerDataIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
