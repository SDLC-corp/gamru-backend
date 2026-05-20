import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  paginateSportsService,
  addSportService,
  updateSportService,
  deleteSportService,
  paginateSportTeamsService,
  addSportTeamService,
  updateSportTeamService,
  deleteSportTeamService,
  paginateSportTournamentsService,
  addSportTournamentService,
  updateSportTournamentService,
  deleteSportTournamentService,
  paginateSportMarketsService,
  addSportMarketService,
  updateSportMarketService,
  deleteSportMarketService,
} from "../service/sport-catalog.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handleError = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

// ─── Sports ────────────────────────────────────────────────────────

export const paginateSports = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;

    const data = await paginateSportsService(page, limit, { search });
    successResponse(res, 200, "Sports fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch sports");
  }
};

export const addSport = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addSportService(req.body);
    successResponse(res, 201, "Sport created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create sport");
  }
};

export const updateSport = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateSportService(req.params.id, req.body);
    successResponse(res, 200, "Sport updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update sport");
  }
};

export const deleteSport = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteSportService(req.params.id);
    successResponse(res, 200, "Sport deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete sport");
  }
};

// ─── Teams ─────────────────────────────────────────────────────────

export const paginateSportTeams = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;
    const sport = (req.query.sport as string) || undefined;
    const tournament = (req.query.tournament as string) || undefined;

    const data = await paginateSportTeamsService(page, limit, {
      search,
      sport,
      tournament,
    });
    successResponse(res, 200, "Teams fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch teams");
  }
};

export const addSportTeam = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addSportTeamService(req.body);
    successResponse(res, 201, "Team created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create team");
  }
};

export const updateSportTeam = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateSportTeamService(req.params.id, req.body);
    successResponse(res, 200, "Team updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update team");
  }
};

export const deleteSportTeam = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteSportTeamService(req.params.id);
    successResponse(res, 200, "Team deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete team");
  }
};

// ─── Tournaments ───────────────────────────────────────────────────

export const paginateSportTournaments = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;

    const data = await paginateSportTournamentsService(page, limit, { search });
    successResponse(res, 200, "Tournaments fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch tournaments");
  }
};

export const addSportTournament = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addSportTournamentService(req.body);
    successResponse(res, 201, "Tournament created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create tournament");
  }
};

export const updateSportTournament = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateSportTournamentService(req.params.id, req.body);
    successResponse(res, 200, "Tournament updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update tournament");
  }
};

export const deleteSportTournament = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteSportTournamentService(req.params.id);
    successResponse(res, 200, "Tournament deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete tournament");
  }
};

// ─── Markets ───────────────────────────────────────────────────────

export const paginateSportMarkets = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search as string) || undefined;

    const data = await paginateSportMarketsService(page, limit, { search });
    successResponse(res, 200, "Markets fetched successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to fetch markets");
  }
};

export const addSportMarket = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await addSportMarketService(req.body);
    successResponse(res, 201, "Market created successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to create market");
  }
};

export const updateSportMarket = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateSportMarketService(req.params.id, req.body);
    successResponse(res, 200, "Market updated successfully", data);
  } catch (error) {
    handleError(res, error, "Failed to update market");
  }
};

export const deleteSportMarket = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteSportMarketService(req.params.id);
    successResponse(res, 200, "Market deleted successfully", null);
  } catch (error) {
    handleError(res, error, "Failed to delete market");
  }
};
