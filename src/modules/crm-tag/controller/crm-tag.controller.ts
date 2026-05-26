import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  paginateCrmTagsService,
  addCrmTagService,
  updateCrmTagService,
  deleteCrmTagService,
} from "../service/crm-tag.service";
import { CrmTagCategory } from "../model/crm-tag.model";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

export const paginateCrmTags = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as CrmTagCategory) || undefined;

    const data = await paginateCrmTagsService(page, limit, {
      search,
      category,
    });
    successResponse(res, 200, "CRM tags fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to fetch CRM tags");
  }
};

export const addCrmTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { name, description, category } = req.body;
    const data = await addCrmTagService({
      name,
      description,
      category,
      created_by: req.user?.email ?? null,
    });
    successResponse(res, 201, "CRM tag created successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to create CRM tag");
  }
};

export const updateCrmTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateCrmTagService(id, req.body);
    successResponse(res, 200, "CRM tag updated successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to update CRM tag");
  }
};

export const deleteCrmTag = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteCrmTagService(id);
    successResponse(res, 200, "CRM tag deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to delete CRM tag");
  }
};
