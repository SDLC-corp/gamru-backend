import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  listWebhooksService,
  getWebhookService,
  createWebhookService,
  updateWebhookService,
  deleteWebhookService,
} from "../service/webhook.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const listWebhooks = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listWebhooksService();
    successResponse(res, 200, "Webhooks fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch webhooks");
  }
};

export const getWebhook = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getWebhookService(req.params.id);
    successResponse(res, 200, "Webhook fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch webhook");
  }
};

export const createWebhook = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createWebhookService(req.body);
    successResponse(res, 201, "Webhook created successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to create webhook");
  }
};

export const updateWebhook = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateWebhookService(req.params.id, req.body);
    successResponse(res, 200, "Webhook updated successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to update webhook");
  }
};

export const deleteWebhook = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteWebhookService(req.params.id);
    successResponse(res, 200, "Webhook deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete webhook");
  }
};
