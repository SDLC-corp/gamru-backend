import { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  resetPasswordService,
} from "../service/auth.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { AuthRequest } from "../../../types/request.type";

export const register = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { first_name, last_name, email, password, mobile, tenant_id } = req.body;

    // Tenant for the new user, in precedence order:
    //   1. explicit tenant_id in body (admin creating user in a specific tenant)
    //   2. tenant resolved from subdomain/header by resolveTenant middleware
    //   3. default tenant (auth.service falls back if undefined)
    const explicitTenantId =
      tenant_id ?? (req as AuthRequest).tenantId ?? undefined;

    const data = await registerService(
      first_name,
      last_name,
      email,
      password,
      mobile,
      explicitTenantId ?? undefined
    );

    successResponse(res, 201, "User registered successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to register user");
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Optional tenant hint: subdomain/header lets login distinguish
    // two users with the same email in different tenants.
    const tenantHint = (req as AuthRequest).tenantId ?? null;

    const data = await loginService(email, password, tenantHint);

    successResponse(res, 200, "Login successful", data);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to login");
    }
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email, token, new_password } = req.body;
    await resetPasswordService(email, token, new_password);
    successResponse(res, 200, "Password reset successful", { email });
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to reset password");
    }
  }
};
