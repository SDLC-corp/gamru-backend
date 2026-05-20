import Joi from "joi";

const PANELS = ["core", "gamification", "mission", "crm", "platform", "widgets"];

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

export const panelParamSchema = Joi.object({
  panel: Joi.string().valid(...PANELS).required(),
});

export const panelKeyParamSchema = Joi.object({
  panel: Joi.string().valid(...PANELS).required(),
  key: Joi.string().min(1).max(150).required(),
});

export const upsertSettingSchema = Joi.object({
  value: Joi.any().required(),
  description: Joi.string().allow("", null).optional(),
});

export const bulkUpsertSettingsSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        panel: Joi.string().valid(...PANELS).required(),
        key: Joi.string().min(1).max(150).required(),
        value: Joi.any().required(),
        description: Joi.string().allow("", null).optional(),
      })
    )
    .min(1)
    .required(),
});

const accountStatusItem = Joi.object({
  unique_key: Joi.string().min(1).max(100).required(),
  display_name: Joi.string().min(1).max(100).required(),
  icon: Joi.string().max(255).allow("", null).optional(),
  color: Joi.string().max(50).allow("", null).optional(),
});

export const createAccountStatusSchema = accountStatusItem;
export const updateAccountStatusSchema = Joi.object({
  unique_key: Joi.string().min(1).max(100).optional(),
  display_name: Joi.string().min(1).max(100).optional(),
  icon: Joi.string().max(255).allow("", null).optional(),
  color: Joi.string().max(50).allow("", null).optional(),
});
export const bulkAccountStatusesSchema = Joi.object({
  items: Joi.array().items(accountStatusItem).required(),
});

const paymentMethodItem = Joi.object({
  unique_key: Joi.string().min(1).max(100).required(),
  display_name: Joi.string().min(1).max(100).required(),
});
export const createPaymentMethodSchema = paymentMethodItem;
export const updatePaymentMethodSchema = Joi.object({
  unique_key: Joi.string().min(1).max(100).optional(),
  display_name: Joi.string().min(1).max(100).optional(),
});
export const bulkPaymentMethodsSchema = Joi.object({
  items: Joi.array().items(paymentMethodItem).required(),
});

const languageItem = Joi.object({
  language: Joi.string().min(1).max(50).required(),
  flag: Joi.string().max(50).allow("", null).optional(),
  flag_emoji: Joi.string().max(10).allow("", null).optional(),
  is_default: Joi.boolean().optional(),
});
export const createLanguageSchema = languageItem;
export const updateLanguageSchema = Joi.object({
  language: Joi.string().min(1).max(50).optional(),
  flag: Joi.string().max(50).allow("", null).optional(),
  flag_emoji: Joi.string().max(10).allow("", null).optional(),
  is_default: Joi.boolean().optional(),
});
export const bulkLanguagesSchema = Joi.object({
  items: Joi.array().items(languageItem).required(),
});

export const createOAuthClientSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  description: Joi.string().max(255).allow("", null).optional(),
  client_id: Joi.string().min(1).max(255).required(),
  client_secret: Joi.string().allow("", null).optional(),
});
export const updateOAuthClientSchema = Joi.object({
  name: Joi.string().min(1).max(150).optional(),
  description: Joi.string().max(255).allow("", null).optional(),
  client_id: Joi.string().min(1).max(255).optional(),
  client_secret: Joi.string().allow("", null).optional(),
});

export const createWebhookSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  url: Joi.string().uri().max(500).required(),
  is_enabled: Joi.boolean().optional(),
});
export const updateWebhookSchema = Joi.object({
  name: Joi.string().min(1).max(150).optional(),
  url: Joi.string().uri().max(500).optional(),
  is_enabled: Joi.boolean().optional(),
});
