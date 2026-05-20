import Joi from "joi";

export const syncEventSchema = Joi.object({
  event_id: Joi.string().trim().min(1).max(180).required(),
  event_type: Joi.string()
    .valid("USER_REGISTERED", "XP_AWARDED", "LEVEL_UP", "RANK_UP")
    .required(),
  external_id: Joi.string().trim().min(1).max(120).required(),
  origin: Joi.string().trim().max(40).optional(),
  email: Joi.string().email().allow(null, "").optional(),
  amount: Joi.number().optional(),
  meta: Joi.object().unknown(true).optional(),
});
