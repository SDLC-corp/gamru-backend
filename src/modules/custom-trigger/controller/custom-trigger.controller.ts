import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createCustomTriggerService,
  paginateCustomTriggersService,
  getCustomTriggerService,
  updateCustomTriggerService,
  archiveCustomTriggerService,
  restoreCustomTriggerService,
  deleteCustomTriggerService,
} from "../service/custom-trigger.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (
  res: Response,
  error: unknown,
  fallback: string
): Response => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const createCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createCustomTriggerService(req.body, createdBy);
    successResponse(res, 200, "Custom trigger created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create custom trigger");
  }
};

export const paginateCustomTriggers = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateCustomTriggersService(page, limit, {
      search: req.query.search as string | undefined,
      trigger: req.query.trigger as string | undefined,
      status: req.query.status as string | undefined,
      tag: req.query.tag as string | undefined,
      archived: req.query.archived === "true",
    });
    successResponse(res, 200, "Custom triggers fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch custom triggers");
  }
};

export const getCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getCustomTriggerService(req.params.id);
    successResponse(res, 200, "Custom trigger fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch custom trigger");
  }
};

export const updateCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateCustomTriggerService(req.params.id, req.body);
    successResponse(res, 200, "Custom trigger updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update custom trigger");
  }
};

export const archiveCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await archiveCustomTriggerService(req.params.id);
    successResponse(res, 200, "Custom trigger archived successfully", data);
  } catch (error) {
    handle(res, error, "Failed to archive custom trigger");
  }
};

export const restoreCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await restoreCustomTriggerService(req.params.id);
    successResponse(res, 200, "Custom trigger restored successfully", data);
  } catch (error) {
    handle(res, error, "Failed to restore custom trigger");
  }
};

export const deleteCustomTrigger = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteCustomTriggerService(req.params.id);
    successResponse(res, 200, "Custom trigger deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete custom trigger");
  }
};
