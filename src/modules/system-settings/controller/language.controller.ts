import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  listLanguagesService,
  getLanguageService,
  createLanguageService,
  updateLanguageService,
  deleteLanguageService,
  replaceLanguagesService,
} from "../service/language.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const listLanguages = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listLanguagesService();
    successResponse(res, 200, "Languages fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch languages");
  }
};

export const getLanguage = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getLanguageService(req.params.id);
    successResponse(res, 200, "Language fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to fetch language");
  }
};

export const createLanguage = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createLanguageService(req.body);
    successResponse(res, 201, "Language created successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to create language");
  }
};

export const updateLanguage = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateLanguageService(req.params.id, req.body);
    successResponse(res, 200, "Language updated successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to update language");
  }
};

export const deleteLanguage = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteLanguageService(req.params.id);
    successResponse(res, 200, "Language deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to delete language");
  }
};

export const replaceLanguages = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await replaceLanguagesService(req.body.items);
    successResponse(res, 200, "Languages saved successfully", data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(res, error.statusCode, error.message);
    return errorResponse(res, 500, "Failed to save languages");
  }
};
