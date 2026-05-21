import Joi from "joi";

// Keep in sync with ALL_CLIENT_SCOPES in modules/client/model/client.model.ts.
const SCOPES = ["events.write", "players.read", "xp.write", "users.write"] as const;
const STATUSES = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;

export const clientIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/)
    .max(60)
    .optional(),
  description: Joi.string().trim().max(500).allow(null, "").optional(),
  contact_email: Joi.string().email().allow(null, "").optional(),
  service_scopes: Joi.array().items(Joi.string().valid(...SCOPES)).optional(),
  ip_allowlist: Joi.array().items(Joi.string().max(64)).allow(null).optional(),
  rate_limit_per_minute: Joi.number().integer().min(1).max(60000).optional(),
  webhook_url: Joi.string().uri().allow(null, "").optional(),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  description: Joi.string().trim().max(500).allow(null, "").optional(),
  contact_email: Joi.string().email().allow(null, "").optional(),
  service_scopes: Joi.array().items(Joi.string().valid(...SCOPES)).optional(),
  ip_allowlist: Joi.array().items(Joi.string().max(64)).allow(null).optional(),
  rate_limit_per_minute: Joi.number().integer().min(1).max(60000).optional(),
  webhook_url: Joi.string().uri().allow(null, "").optional(),
  status: Joi.string().valid(...STATUSES).optional(),
}).min(1);
