import Joi from "joi";

const TYPES = ["DYNAMIC", "STATIC"];

export const createSegmentSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    "string.empty": "Segment name is required",
    "any.required": "Segment name is required",
  }),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  content: Joi.object().unknown(true).allow(null).optional(),
  player_count: Joi.number().integer().min(0).optional(),
  created_by: Joi.string().max(150).allow("", null).optional(),
});

export const updateSegmentSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  description: Joi.string().allow("", null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  content: Joi.object().unknown(true).allow(null).optional(),
  player_count: Joi.number().integer().min(0).optional(),
});

export const segmentIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
