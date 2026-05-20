import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createUnsubscribeReportService,
  paginateUnsubscribeReportsService,
} from "../service/unsubscribe-report.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (res: Response, error: unknown, fallback: string): Response => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const createUnsubscribeReport = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createUnsubscribeReportService(req.body);
    successResponse(res, 200, "Unsubscribe record created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create unsubscribe record");
  }
};

export const paginateUnsubscribeReports = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateUnsubscribeReportsService(page, limit, {
      campaign_name: req.query.campaign_name as string | undefined,
      player_id: req.query.player_id as string | undefined,
      channel: req.query.channel as string | undefined,
      days: req.query.days ? Number(req.query.days) : undefined,
    });
    successResponse(res, 200, "Unsubscribe reports fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch unsubscribe reports");
  }
};
