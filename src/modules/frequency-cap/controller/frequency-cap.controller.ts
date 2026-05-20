import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createFrequencyCapService,
  paginateFrequencyCapsService,
  getFrequencyCapService,
  updateFrequencyCapService,
  deleteFrequencyCapService,
} from "../service/frequency-cap.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (res: Response, error: unknown, fallback: string): Response => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const createFrequencyCap = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createFrequencyCapService(req.body, createdBy);
    successResponse(res, 200, "Frequency cap created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create frequency cap");
  }
};

export const paginateFrequencyCaps = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateFrequencyCapsService(page, limit, {
      search: req.query.search as string | undefined,
      channel: req.query.channel as string | undefined,
      period: req.query.period as string | undefined,
    });
    successResponse(res, 200, "Frequency caps fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch frequency caps");
  }
};

export const getFrequencyCap = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getFrequencyCapService(req.params.id);
    successResponse(res, 200, "Frequency cap fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch frequency cap");
  }
};

export const updateFrequencyCap = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateFrequencyCapService(req.params.id, req.body);
    successResponse(res, 200, "Frequency cap updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update frequency cap");
  }
};

export const deleteFrequencyCap = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteFrequencyCapService(req.params.id);
    successResponse(res, 200, "Frequency cap deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete frequency cap");
  }
};
