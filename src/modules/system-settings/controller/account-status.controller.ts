import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import {
  listAccountStatusesService,
  getAccountStatusService,
  createAccountStatusService,
  updateAccountStatusService,
  deleteAccountStatusService,
  replaceAccountStatusesService,
} from "../service/account-status.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const listAccountStatuses = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listAccountStatusesService();
    successResponse(res, 200, "Account statuses fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch account statuses");
  }
};

export const getAccountStatus = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getAccountStatusService(req.params.id);
    successResponse(res, 200, "Account status fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch account status");
  }
};

export const createAccountStatus = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createAccountStatusService(req.body);
    successResponse(res, 201, "Account status created successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Account status unique_key already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to create account status");
  }
};

export const updateAccountStatus = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateAccountStatusService(req.params.id, req.body);
    successResponse(res, 200, "Account status updated successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Account status unique_key already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to update account status");
  }
};

export const deleteAccountStatus = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteAccountStatusService(req.params.id);
    successResponse(res, 200, "Account status deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete account status");
  }
};

export const replaceAccountStatuses = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await replaceAccountStatusesService(req.body.items);
    successResponse(res, 200, "Account statuses saved successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Duplicate unique_key in items");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to save account statuses");
  }
};
