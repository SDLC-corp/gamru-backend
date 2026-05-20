import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createTemplateService,
  paginateTemplatesService,
  getTemplateService,
  updateTemplateService,
  archiveTemplateService,
  restoreTemplateService,
  deleteTemplateService,
} from "../service/template.service";
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

export const createTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createTemplateService(req.body, createdBy);
    successResponse(res, 200, "Template created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create template");
  }
};

export const paginateTemplates = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateTemplatesService(page, limit, {
      search: req.query.search as string | undefined,
      channel: req.query.channel as string | undefined,
      language: req.query.language as string | undefined,
      tag: req.query.tag as string | undefined,
      archived: req.query.archived === "true",
    });
    successResponse(res, 200, "Templates fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch templates");
  }
};

export const getTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getTemplateService(req.params.id);
    successResponse(res, 200, "Template fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch template");
  }
};

export const updateTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateTemplateService(req.params.id, req.body);
    successResponse(res, 200, "Template updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update template");
  }
};

export const archiveTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await archiveTemplateService(req.params.id);
    successResponse(res, 200, "Template archived successfully", data);
  } catch (error) {
    handle(res, error, "Failed to archive template");
  }
};

export const restoreTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await restoreTemplateService(req.params.id);
    successResponse(res, 200, "Template restored successfully", data);
  } catch (error) {
    handle(res, error, "Failed to restore template");
  }
};

export const deleteTemplate = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteTemplateService(req.params.id);
    successResponse(res, 200, "Template deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete template");
  }
};
