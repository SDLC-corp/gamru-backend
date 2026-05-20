import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import {
  listPaymentMethodsService,
  getPaymentMethodService,
  createPaymentMethodService,
  updatePaymentMethodService,
  deletePaymentMethodService,
  replacePaymentMethodsService,
} from "../service/payment-method.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const listPaymentMethods = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listPaymentMethodsService();
    successResponse(res, 200, "Payment methods fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch payment methods");
  }
};

export const getPaymentMethod = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getPaymentMethodService(req.params.id);
    successResponse(res, 200, "Payment method fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch payment method");
  }
};

export const createPaymentMethod = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createPaymentMethodService(req.body);
    successResponse(res, 201, "Payment method created successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Payment method unique_key already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to create payment method");
  }
};

export const updatePaymentMethod = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updatePaymentMethodService(req.params.id, req.body);
    successResponse(res, 200, "Payment method updated successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Payment method unique_key already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to update payment method");
  }
};

export const deletePaymentMethod = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deletePaymentMethodService(req.params.id);
    successResponse(res, 200, "Payment method deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete payment method");
  }
};

export const replacePaymentMethods = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await replacePaymentMethodsService(req.body.items);
    successResponse(res, 200, "Payment methods saved successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Duplicate unique_key in items");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to save payment methods");
  }
};
