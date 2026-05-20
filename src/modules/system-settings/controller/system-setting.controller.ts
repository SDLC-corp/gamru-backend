import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  getAllSettingsService,
  getSettingsByPanelService,
  getSettingService,
  upsertSettingService,
  bulkUpsertSettingsService,
  deleteSettingService,
} from "../service/system-setting.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const getAllSettings = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getAllSettingsService();
    successResponse(res, 200, "Settings fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch settings");
  }
};

export const getSettingsByPanel = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { panel } = req.params;
    const data = await getSettingsByPanelService(panel);
    successResponse(res, 200, "Settings fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch settings");
  }
};

export const getSetting = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { panel, key } = req.params;
    const data = await getSettingService(panel, key);
    successResponse(res, 200, "Setting fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch setting");
  }
};

export const upsertSetting = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { panel, key } = req.params;
    const { value, description } = req.body;
    const data = await upsertSettingService(panel, key, value, description);
    successResponse(res, 200, "Setting saved successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to save setting");
  }
};

export const bulkUpsertSettings = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { items } = req.body;
    const data = await bulkUpsertSettingsService(items);
    successResponse(res, 200, "Settings saved successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to save settings");
  }
};

export const deleteSetting = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { panel, key } = req.params;
    await deleteSettingService(panel, key);
    successResponse(res, 200, "Setting deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete setting");
  }
};
