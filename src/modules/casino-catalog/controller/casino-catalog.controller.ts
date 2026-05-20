import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  paginateCasinoGamesService,
  addCasinoGameService,
  updateCasinoGameService,
  deleteCasinoGameService,
  paginateCasinoCategoriesService,
  addCasinoCategoryService,
  updateCasinoCategoryService,
  deleteCasinoCategoryService,
  paginateCasinoProvidersService,
  addCasinoProviderService,
  updateCasinoProviderService,
  deleteCasinoProviderService,
} from "../service/casino-catalog.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handleError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

// ─── Games ─────────────────────────────────────────────────────────

export const paginateCasinoGames = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;
    const provider = (req.query.provider as string) || undefined;
    const category = (req.query.category as string) || undefined;

    const data = await paginateCasinoGamesService(page, limit, {
      search,
      provider,
      category,
    });
    successResponse(res, 200, "Casino games fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch casino games");
  }
};

export const addCasinoGame = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addCasinoGameService(req.body);
    successResponse(res, 201, "Casino game created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create casino game");
  }
};

export const updateCasinoGame = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateCasinoGameService(id, req.body);
    successResponse(res, 200, "Casino game updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update casino game");
  }
};

export const deleteCasinoGame = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteCasinoGameService(req.params.id);
    successResponse(res, 200, "Casino game deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete casino game");
  }
};

// ─── Categories ────────────────────────────────────────────────────

export const paginateCasinoCategories = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;

    const data = await paginateCasinoCategoriesService(page, limit, { search });
    successResponse(res, 200, "Casino categories fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch casino categories");
  }
};

export const addCasinoCategory = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addCasinoCategoryService(req.body);
    successResponse(res, 201, "Casino category created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create casino category");
  }
};

export const updateCasinoCategory = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateCasinoCategoryService(id, req.body);
    successResponse(res, 200, "Casino category updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update casino category");
  }
};

export const deleteCasinoCategory = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteCasinoCategoryService(req.params.id);
    successResponse(res, 200, "Casino category deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete casino category");
  }
};

// ─── Providers ─────────────────────────────────────────────────────

export const paginateCasinoProviders = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;

    const data = await paginateCasinoProvidersService(page, limit, { search });
    successResponse(res, 200, "Casino providers fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch casino providers");
  }
};

export const addCasinoProvider = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addCasinoProviderService(req.body);
    successResponse(res, 201, "Casino provider created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create casino provider");
  }
};

export const updateCasinoProvider = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateCasinoProviderService(id, req.body);
    successResponse(res, 200, "Casino provider updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update casino provider");
  }
};

export const deleteCasinoProvider = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteCasinoProviderService(req.params.id);
    successResponse(res, 200, "Casino provider deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete casino provider");
  }
};
