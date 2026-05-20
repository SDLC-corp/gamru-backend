import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createCampaignService,
  paginateCampaignsService,
  getCampaignService,
  updateCampaignService,
  archiveCampaignService,
  restoreCampaignService,
  deleteCampaignService,
} from "../service/campaign.service";
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

export const createCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createCampaignService(req.body, createdBy);
    successResponse(res, 200, "Campaign created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create campaign");
  }
};

export const paginateCampaigns = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateCampaignsService(page, limit, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      trigger: req.query.trigger as string | undefined,
      tag: req.query.tag as string | undefined,
      archived: req.query.archived === "true",
    });
    successResponse(res, 200, "Campaigns fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch campaigns");
  }
};

export const getCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getCampaignService(req.params.id);
    successResponse(res, 200, "Campaign fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch campaign");
  }
};

export const updateCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateCampaignService(req.params.id, req.body);
    successResponse(res, 200, "Campaign updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update campaign");
  }
};

export const archiveCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await archiveCampaignService(req.params.id);
    successResponse(res, 200, "Campaign archived successfully", data);
  } catch (error) {
    handle(res, error, "Failed to archive campaign");
  }
};

export const restoreCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await restoreCampaignService(req.params.id);
    successResponse(res, 200, "Campaign restored successfully", data);
  } catch (error) {
    handle(res, error, "Failed to restore campaign");
  }
};

export const deleteCampaign = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteCampaignService(req.params.id);
    successResponse(res, 200, "Campaign deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete campaign");
  }
};
