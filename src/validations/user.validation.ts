import Joi from "joi";

export const paginateSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
});

export const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID must be a valid UUID",
    "any.required": "ID is required",
  }),
});

export const addOrUpdateUserSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 100 characters",
    "any.required": "First name is required",
  }),
  last_name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name cannot exceed 100 characters",
    "any.required": "Last name is required",
  }),
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile must be 10–15 digits",
      "string.empty": "Mobile is required",
      "any.required": "Mobile is required",
    }),
  username: Joi.string().min(3).max(100).messages({
    "string.base": "Username must be a string",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 100 characters",
  }),
  role: Joi.string().valid("USER", "ADMIN").messages({
    "string.base": "Role must be a string",
    "any.only": "Role must be either USER or ADMIN",
  }),
  password: Joi.string().min(6).max(100).messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password cannot exceed 100 characters",
  }),
  status: Joi.string().valid("ACTIVE", "INACTIVE").messages({
    "string.base": "Status must be a string",
    "any.only": "Status must be either ACTIVE or INACTIVE",
  }),
});

export const updateMeSchema = Joi.object({
  email: Joi.string().email().lowercase().messages({
    "string.email": "Please enter a valid email",
  }),
  username: Joi.string().min(3).max(100).messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 100 characters",
  }),
  timezone: Joi.string().max(100).messages({
    "string.max": "Timezone cannot exceed 100 characters",
  }),
  theme: Joi.string()
    .valid(
      "dark",
      "light",
      "white",
      "thin",
      "midnight",
      "slate",
      "ocean",
      "forest",
      "contrast"
    )
    .messages({
      "any.only": "Invalid theme selected",
    }),
  two_factor_enabled: Joi.boolean().messages({
    "boolean.base": "Two-factor value must be true or false",
  }),
}).min(1).messages({
  "object.min": "At least one field is required to update",
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),
  new_password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters",
    "string.max": "New password cannot exceed 100 characters",
    "any.required": "New password is required",
  }),
});
