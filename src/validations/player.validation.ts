import Joi from "joi";

const STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED", "N/A"];

const jsonObj = Joi.object().unknown(true).allow(null).optional();

export const createPlayerSchema = Joi.object({
  player_id: Joi.string().min(2).max(120).required().messages({
    "string.empty": "player_id is required",
    "any.required": "player_id is required",
  }),
  username: Joi.string().min(2).max(120).required().messages({
    "string.empty": "username is required",
    "any.required": "username is required",
  }),
  name: Joi.string().max(150).allow("", null).optional(),
  email: Joi.string().email().allow("", null).optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  registration_date: Joi.date().iso().allow(null).optional(),
  country: Joi.string().max(80).allow("", null).optional(),
  city: Joi.string().max(80).allow("", null).optional(),
  avatar_url: Joi.string().max(400).allow("", null).optional(),
  mobile_number: Joi.string().max(40).allow("", null).optional(),
  birthday: Joi.date().iso().allow(null).optional(),
  address: Joi.string().max(255).allow("", null).optional(),
  language: Joi.string().max(40).allow("", null).optional(),
  account_status: Joi.string().max(60).allow("", null).optional(),
  gamification_active: Joi.boolean().optional(),
  level: Joi.number().optional(),
  max_level: Joi.number().optional(),
  xp_points: Joi.number().optional(),
  xp_to_next: Joi.number().optional(),
  rank_name: Joi.string().max(60).allow("", null).optional(),
  tokens: Joi.number().optional(),
  consents: jsonObj,
  personalization: jsonObj,
  player_data: jsonObj,
  custom_data: jsonObj,
  transactional_data: jsonObj,
});

export const updatePlayerSchema = createPlayerSchema.fork(
  ["player_id", "username"],
  (s) => s.optional()
);

export const playerIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

export const addXpByEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "email is required",
    "string.email": "email must be a valid email",
    "any.required": "email is required",
  }),
  amount: Joi.number().invalid(0).required().messages({
    "number.base": "amount must be a number",
    "any.invalid": "amount must be a non-zero number",
    "any.required": "amount is required",
  }),
  // Optional per-play game metadata. When present it feeds the player's
  // casino personalization aggregate (category/provider mix + favorites).
  game: Joi.object({
    id: Joi.string().max(120).allow("", null).optional(),
    name: Joi.string().max(160).allow("", null).optional(),
    category: Joi.string().max(120).allow("", null).optional(),
    provider: Joi.string().max(120).allow("", null).optional(),
    turnover: Joi.number().min(0).optional(),
  })
    .allow(null)
    .optional(),
});

export const manualRewardSchema = Joi.object({
  reward_type: Joi.string().min(1).max(120).required().messages({
    "string.empty": "Reward Type is required",
    "any.required": "Reward Type is required",
  }),
  reward: Joi.string().max(180).allow("", null).optional(),
});
