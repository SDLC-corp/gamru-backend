import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  paginateMediaService,
  addMediaService,
  deleteMediaService,
  toMediaDTO,
} from "../service/media-database.service";
import { MediaDatabaseCategory } from "../model/media-database.model";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const getBaseUrl = (req: AuthRequest) =>
  `${req.protocol}://${req.get("host")}`;

export const paginateMedia = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const search = (req.query.search as string) || undefined;
    const rawCategory = (req.query.category as string) || undefined;
    const category =
      rawCategory && rawCategory !== "all"
        ? (rawCategory as MediaDatabaseCategory)
        : undefined;

    const result = await paginateMediaService(page, limit, {
      search,
      category,
    });

    const baseUrl = getBaseUrl(req);
    successResponse(res, 200, "Media fetched successfully", {
      data: result.data.map((row) => toMediaDTO(row, baseUrl)),
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to fetch media");
  }
};

export const addMedia = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    if (!req.file) {
      return errorResponse(res, 422, "Image file is required");
    }

    const { name, description, category } = req.body;

    const row = await addMediaService({
      name,
      description,
      category,
      file_path: req.file.filename,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      created_by: req.user?.email ?? null,
    });

    successResponse(
      res,
      201,
      "File uploaded successfully",
      toMediaDTO(row, getBaseUrl(req))
    );
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to upload file");
  }
};

export const deleteMedia = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteMediaService(req.params.id);
    successResponse(res, 200, "Media deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    return errorResponse(res, 500, "Failed to delete media");
  }
};
