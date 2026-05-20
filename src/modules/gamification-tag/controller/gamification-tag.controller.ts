import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  paginateGamificationTagsService,
  addGamificationTagService,
  updateGamificationTagService,
  deleteGamificationTagService,
} from "../service/gamification-tag.service";
import { GamificationTagCategory } from "../model/gamification-tag.model";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const paginateGamificationTags = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;
    const category =
      (req.query.category as GamificationTagCategory) || undefined;

    const data = await paginateGamificationTagsService(page, limit, {
      search,
      category,
    });
    successResponse(res, 200, "Gamification tags fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to fetch gamification tags");
  }
};

export const addGamificationTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { name, description, category } = req.body;
    const data = await addGamificationTagService({
      name,
      description,
      category,
      created_by: req.user?.email ?? null,
    });
    successResponse(res, 201, "Gamification tag created successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to create gamification tag");
  }
};

export const updateGamificationTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateGamificationTagService(id, req.body);
    successResponse(res, 200, "Gamification tag updated successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to update gamification tag");
  }
};

export const deleteGamificationTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteGamificationTagService(id);
    successResponse(res, 200, "Gamification tag deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to delete gamification tag");
  }
};
