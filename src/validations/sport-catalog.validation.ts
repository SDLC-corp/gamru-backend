import Joi from "joi";

const paginateBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow("").optional(),
};

export const sportIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

// ─── Sports / Tournaments / Markets (name only) ────────────────────

export const paginateSportSimpleSchema = Joi.object(paginateBase);

export const addSportSimpleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
});

export const updateSportSimpleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
});

// ─── Teams ─────────────────────────────────────────────────────────

export const paginateSportTeamSchema = Joi.object({
  ...paginateBase,
  sport: Joi.string().trim().allow("").optional(),
  tournament: Joi.string().trim().allow("").optional(),
});

export const addSportTeamSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  sport: Joi.string().trim().allow("", null).max(150).optional(),
  tournament: Joi.string().trim().allow("", null).max(150).optional(),
});

export const updateSportTeamSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  sport: Joi.string().trim().allow("", null).max(150).optional(),
  tournament: Joi.string().trim().allow("", null).max(150).optional(),
});
