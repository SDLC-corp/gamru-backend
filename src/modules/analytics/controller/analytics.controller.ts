import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  getCampaignAnalyticsService,
  getCampaignAnalyticsDetailService,
  getHistoryService,
  trackEventService,
} from "../service/analytics.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (res: Response, error: unknown, fallback: string): Response => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const getCampaignAnalytics = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const data = await getCampaignAnalyticsService(page, limit, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      tag: req.query.tag as string | undefined,
      period: req.query.period as string | undefined,
    });
    successResponse(res, 200, "Campaign analytics fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch campaign analytics");
  }
};

export const getCampaignAnalyticsDetail = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getCampaignAnalyticsDetailService(req.params.id);
    successResponse(res, 200, "Campaign analytics fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch campaign analytics");
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const data = await getHistoryService(page, limit, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      channel: req.query.channel as string | undefined,
      period: req.query.period as string | undefined,
    });
    successResponse(res, 200, "Campaign history fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch campaign history");
  }
};

export const trackEvent = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await trackEventService(req.body);
    successResponse(res, 200, "Event tracked successfully", data);
  } catch (error) {
    handle(res, error, "Failed to track event");
  }
};
