import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import {
  listOAuthClientsService,
  getOAuthClientService,
  createOAuthClientService,
  updateOAuthClientService,
  deleteOAuthClientService,
} from "../service/oauth-client.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const listOAuthClients = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listOAuthClientsService();
    successResponse(res, 200, "OAuth clients fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch OAuth clients");
  }
};

export const getOAuthClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getOAuthClientService(req.params.id);
    successResponse(res, 200, "OAuth client fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch OAuth client");
  }
};

export const createOAuthClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createOAuthClientService(req.body);
    successResponse(res, 201, "OAuth client created successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "client_id already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to create OAuth client");
  }
};

export const updateOAuthClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateOAuthClientService(req.params.id, req.body);
    successResponse(res, 200, "OAuth client updated successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "client_id already exists");
    }
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to update OAuth client");
  }
};

export const deleteOAuthClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteOAuthClientService(req.params.id);
    successResponse(res, 200, "OAuth client deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete OAuth client");
  }
};
