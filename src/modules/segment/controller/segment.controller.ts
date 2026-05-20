import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  createSegmentService,
  paginateSegmentsService,
  getSegmentService,
  updateSegmentService,
  archiveSegmentService,
  restoreSegmentService,
  deleteSegmentService,
  listSegmentCreatorsService,
} from "../service/segment.service";
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

export const createSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const createdBy = req.body.created_by || req.user?.email || null;
    const data = await createSegmentService(req.body, createdBy);
    successResponse(res, 200, "Segment created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create segment");
  }
};

export const paginateSegments = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateSegmentsService(page, limit, {
      search: req.query.search as string | undefined,
      type: req.query.type as string | undefined,
      created_by: req.query.created_by as string | undefined,
      tag: req.query.tag as string | undefined,
      archived: req.query.archived === "true",
    });
    successResponse(res, 200, "Segments fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch segments");
  }
};

export const getSegmentCreators = async (
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await listSegmentCreatorsService();
    successResponse(res, 200, "Segment creators fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch segment creators");
  }
};

export const getSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getSegmentService(req.params.id);
    successResponse(res, 200, "Segment fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch segment");
  }
};

export const updateSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateSegmentService(req.params.id, req.body);
    successResponse(res, 200, "Segment updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update segment");
  }
};

export const archiveSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await archiveSegmentService(req.params.id);
    successResponse(res, 200, "Segment archived successfully", data);
  } catch (error) {
    handle(res, error, "Failed to archive segment");
  }
};

export const restoreSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await restoreSegmentService(req.params.id);
    successResponse(res, 200, "Segment restored successfully", data);
  } catch (error) {
    handle(res, error, "Failed to restore segment");
  }
};

export const deleteSegment = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteSegmentService(req.params.id);
    successResponse(res, 200, "Segment deleted successfully", null);
  } catch (error) {
    handle(res, error, "Failed to delete segment");
  }
};
