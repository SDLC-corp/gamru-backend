import { Router } from "express";
import { register, login, resetPassword } from "../modules/auth/controller/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, resetPasswordSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
