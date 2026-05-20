import Joi from "joi";

const paginateBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow("").optional(),
};

const stringIdParam = Joi.object({
  id: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "ID is required",
    "any.required": "ID is required",
  }),
});

// ─── Games ─────────────────────────────────────────────────────────

export const paginateCasinoGameSchema = Joi.object({
  ...paginateBase,
  provider: Joi.string().trim().allow("").optional(),
  category: Joi.string().trim().allow("").optional(),
});

const deviceSupportSchema = Joi.object({
  mobile: Joi.boolean().default(false),
  desktop: Joi.boolean().default(false),
});

export const addCasinoGameSchema = Joi.object({
  id: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "ID is required",
    "any.required": "ID is required",
  }),
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  provider: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Provider is required",
    "any.required": "Provider is required",
  }),
  category: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Category is required",
    "any.required": "Category is required",
  }),
  game_thumbnail: Joi.string().trim().allow("", null).max(500).optional(),
  tournament_widget_thumbnail: Joi.string()
    .trim()
    .allow("", null)
    .max(500)
    .optional(),
  bonus_buy_allow: Joi.boolean().default(false),
  device_support: deviceSupportSchema.optional(),
});

export const updateCasinoGameSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  provider: Joi.string().trim().min(1).max(150).optional(),
  category: Joi.string().trim().min(1).max(150).optional(),
  game_thumbnail: Joi.string().trim().allow("", null).max(500).optional(),
  tournament_widget_thumbnail: Joi.string()
    .trim()
    .allow("", null)
    .max(500)
    .optional(),
  bonus_buy_allow: Joi.boolean().optional(),
  device_support: deviceSupportSchema.optional(),
});

// ─── Categories & Providers (id + name) ────────────────────────────

export const paginateCasinoSimpleSchema = Joi.object(paginateBase);

export const addCasinoSimpleSchema = Joi.object({
  id: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "ID is required",
    "any.required": "ID is required",
  }),
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
});

export const updateCasinoSimpleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
});

export const casinoIdParamSchema = stringIdParam;
