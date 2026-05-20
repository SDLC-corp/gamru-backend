import SportRepository from "../model/sport.repository";
import SportTeamRepository from "../model/sport-team.repository";
import SportTournamentRepository from "../model/sport-tournament.repository";
import SportMarketRepository from "../model/sport-market.repository";
import { AppError } from "../../../utils/AppError";

// ─── Sports ────────────────────────────────────────────────────────

export const paginateSportsService = (
  page: number,
  limit: number,
  filters: { search?: string }
) => SportRepository.paginateSports(page, limit, filters);

export const addSportService = (data: { name: string }) =>
  SportRepository.create({ name: data.name });

export const updateSportService = async (
  id: string,
  data: { name?: string }
) => {
  const updated = await SportRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Sport not found", 404);
  }
  return updated;
};

export const deleteSportService = async (id: string) => {
  const deleted = await SportRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Sport not found", 404);
  }
  return null;
};

// ─── Teams ─────────────────────────────────────────────────────────

export interface SportTeamInput {
  name: string;
  sport?: string | null;
  tournament?: string | null;
}

export const paginateSportTeamsService = (
  page: number,
  limit: number,
  filters: { search?: string; sport?: string; tournament?: string }
) => SportTeamRepository.paginateTeams(page, limit, filters);

export const addSportTeamService = (data: SportTeamInput) =>
  SportTeamRepository.create({
    name: data.name,
    sport: data.sport ?? null,
    tournament: data.tournament ?? null,
  });

export const updateSportTeamService = async (
  id: string,
  data: Partial<SportTeamInput>
) => {
  const updated = await SportTeamRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Team not found", 404);
  }
  return updated;
};

export const deleteSportTeamService = async (id: string) => {
  const deleted = await SportTeamRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Team not found", 404);
  }
  return null;
};

// ─── Tournaments ───────────────────────────────────────────────────

export const paginateSportTournamentsService = (
  page: number,
  limit: number,
  filters: { search?: string }
) => SportTournamentRepository.paginateTournaments(page, limit, filters);

export const addSportTournamentService = (data: { name: string }) =>
  SportTournamentRepository.create({ name: data.name });

export const updateSportTournamentService = async (
  id: string,
  data: { name?: string }
) => {
  const updated = await SportTournamentRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Tournament not found", 404);
  }
  return updated;
};

export const deleteSportTournamentService = async (id: string) => {
  const deleted = await SportTournamentRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Tournament not found", 404);
  }
  return null;
};

// ─── Markets ───────────────────────────────────────────────────────

export const paginateSportMarketsService = (
  page: number,
  limit: number,
  filters: { search?: string }
) => SportMarketRepository.paginateMarkets(page, limit, filters);

export const addSportMarketService = (data: { name: string }) =>
  SportMarketRepository.create({ name: data.name });

export const updateSportMarketService = async (
  id: string,
  data: { name?: string }
) => {
  const updated = await SportMarketRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Market not found", 404);
  }
  return updated;
};

export const deleteSportMarketService = async (id: string) => {
  const deleted = await SportMarketRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Market not found", 404);
  }
  return null;
};
