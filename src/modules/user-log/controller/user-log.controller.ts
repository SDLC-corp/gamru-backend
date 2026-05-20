import { Response } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  addLogService,
  getLogsService,
  getLogByIdService,
  paginateLogsService,
  updateLogService,
  deleteLogService,
} from "../service/user-log.service";

import { successResponse, errorResponse } from "../../../utils/responseHandler";

export const addLog = async (req: AuthRequest, res: Response) => {
  try {
    const data = await addLogService(req.body);
    return successResponse(res, 201, "Log created successfully", data);
  } catch (error: any) {
    return errorResponse(res, error.statusCode || 500, error.message || "Failed to create log");
  }
};


export const getLogs = async (_req: AuthRequest, res: Response) => {
  try {
    const data = await getLogsService();
    return successResponse(res, 200, "Logs fetched successfully", data);
  } catch (error: any) {
    return errorResponse(res, 500, "Failed to fetch logs");
  }
};

export const getLogById = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getLogByIdService(req.params.id);
    return successResponse(res, 200, "Log fetched successfully", data);
  } catch (error: any) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};


export const paginateLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const data = await paginateLogsService(
      filters,
      Number(page),
      Number(limit)
    );

    return successResponse(res, 200, "Logs fetched successfully", data);
  } catch (error: any) {
    return errorResponse(res, 500, "Failed to fetch logs");
  }
};

export const updateLog = async (req: AuthRequest, res: Response) => {
  try {
    const data = await updateLogService(req.params.id, req.body);
    return successResponse(res, 200, "Log updated successfully", data);
  } catch (error: any) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

export const deleteLog = async (req: AuthRequest, res: Response) => {
  try {
    await deleteLogService(req.params.id);
    return successResponse(res, 200, "Log deleted successfully", null);
  } catch (error: any) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};