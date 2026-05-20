import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createPlayerDataService,
  bulkCreatePlayerDataService,
  paginatePlayerDataService,
  updatePlayerDataService,
  deletePlayerDataService,
} from "../service/player-data.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (res: Response, error: unknown, fallback: string): Response => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const createPlayerData = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createPlayerDataService(req.body, createdBy);
    successResponse(res, 200, "Custom data created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create custom data");
  }
};

export const bulkCreatePlayerData = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const rows = req.body.rows;
    const data = await bulkCreatePlayerDataService(rows, createdBy);
    successResponse(res, 200, "Custom data imported successfully", data);
  } catch (error) {
    handle(res, error, "Failed to import custom data");
  }
};

export const paginatePlayerData = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);

    const isCustom =
      req.query.is_custom === undefined
        ? undefined
        : req.query.is_custom === "true";

    const data = await paginatePlayerDataService(page, limit, {
      search: req.query.search as string | undefined,
      data_type: req.query.data_type as string | undefined,
      is_custom: isCustom,
    });
    successResponse(res, 200, "Player data fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch player data");
  }
};

export const updatePlayerData = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updatePlayerDataService(req.params.id, req.body);
    successResponse(res, 200, "Custom data updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update custom data");
  }
};

export const deletePlayerData = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deletePlayerDataService(req.params.id);
    successResponse(res, 200, "Custom data deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete custom data");
  }
};
