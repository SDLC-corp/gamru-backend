import Joi from "joi";

export const paginateGamificationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  search: Joi.string().trim().allow("").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  archived: Joi.boolean().truthy("true").falsy("false").optional(),
  tag: Joi.string().trim().allow("").optional(),
});

// A single configured level inside a Rank: an XP window plus an optional
// per-level reward. Used by the Ranks wizard (data.levels[]).
const rankLevelSchema = Joi.object({
  level: Joi.number().integer().min(0).required(),
  xp_start: Joi.number().min(0).required(),
  xp_end: Joi.number().min(Joi.ref("xp_start")).required(),
  reward_type: Joi.string().allow("", null).optional(),
  reward_value: Joi.number().min(0).allow(null).optional(),
}).unknown(true);

export const upsertGamificationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),
  description: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  priority: Joi.number().integer().min(0).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  // `data` stays generic across every gamification feature; when a Ranks
  // payload includes `levels` we validate each row's XP window.
  data: Joi.object({
    levels: Joi.array().items(rankLevelSchema).optional(),
  })
    .unknown(true)
    .optional(),
});

export const archiveGamificationSchema = Joi.object({
  archived: Joi.boolean().required(),
});

export const gamificationIdParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});
