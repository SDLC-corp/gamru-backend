import CasinoGameRepository from "../model/casino-game.repository";
import CasinoCategoryRepository from "../model/casino-category.repository";
import CasinoProviderRepository from "../model/casino-provider.repository";
import { DeviceSupport } from "../model/casino-game.model";
import { AppError } from "../../../utils/AppError";

// ─── Games ─────────────────────────────────────────────────────────

export interface CasinoGameInput {
  id: string;
  name: string;
  provider: string;
  category: string;
  game_thumbnail?: string | null;
  tournament_widget_thumbnail?: string | null;
  bonus_buy_allow?: boolean;
  device_support?: DeviceSupport;
}

export const paginateCasinoGamesService = (
  page: number,
  limit: number,
  filters: { search?: string; provider?: string; category?: string }
) => CasinoGameRepository.paginateGames(page, limit, filters);

export const addCasinoGameService = async (data: CasinoGameInput) => {
  const existing = await CasinoGameRepository.findByPk(data.id);
  if (existing) {
    throw new AppError("Game with this ID already exists", 409);
  }
  return CasinoGameRepository.create({
    id: data.id,
    name: data.name,
    provider: data.provider,
    category: data.category,
    game_thumbnail: data.game_thumbnail ?? null,
    tournament_widget_thumbnail: data.tournament_widget_thumbnail ?? null,
    bonus_buy_allow: data.bonus_buy_allow ?? false,
    device_support: data.device_support ?? { mobile: false, desktop: false },
  });
};

export const updateCasinoGameService = async (
  id: string,
  data: Partial<Omit<CasinoGameInput, "id">>
) => {
  const updated = await CasinoGameRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Game not found", 404);
  }
  return updated;
};

export const deleteCasinoGameService = async (id: string) => {
  const deleted = await CasinoGameRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Game not found", 404);
  }
  return null;
};

// ─── Categories ────────────────────────────────────────────────────

export interface CasinoCategoryInput {
  id: string;
  name: string;
}

export const paginateCasinoCategoriesService = (
  page: number,
  limit: number,
  filters: { search?: string }
) => CasinoCategoryRepository.paginateCategories(page, limit, filters);

export const addCasinoCategoryService = async (data: CasinoCategoryInput) => {
  const existing = await CasinoCategoryRepository.findByPk(data.id);
  if (existing) {
    throw new AppError("Category with this ID already exists", 409);
  }
  return CasinoCategoryRepository.create({ id: data.id, name: data.name });
};

export const updateCasinoCategoryService = async (
  id: string,
  data: { name?: string }
) => {
  const updated = await CasinoCategoryRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Category not found", 404);
  }
  return updated;
};

export const deleteCasinoCategoryService = async (id: string) => {
  const deleted = await CasinoCategoryRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Category not found", 404);
  }
  return null;
};

// ─── Providers ─────────────────────────────────────────────────────

export interface CasinoProviderInput {
  id: string;
  name: string;
}

export const paginateCasinoProvidersService = (
  page: number,
  limit: number,
  filters: { search?: string }
) => CasinoProviderRepository.paginateProviders(page, limit, filters);

export const addCasinoProviderService = async (data: CasinoProviderInput) => {
  const existing = await CasinoProviderRepository.findByPk(data.id);
  if (existing) {
    throw new AppError("Provider with this ID already exists", 409);
  }
  return CasinoProviderRepository.create({ id: data.id, name: data.name });
};

export const updateCasinoProviderService = async (
  id: string,
  data: { name?: string }
) => {
  const updated = await CasinoProviderRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Provider not found", 404);
  }
  return updated;
};

export const deleteCasinoProviderService = async (id: string) => {
  const deleted = await CasinoProviderRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Provider not found", 404);
  }
  return null;
};
