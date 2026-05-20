import GamificationTagRepository from "../model/gamification-tag.repository";
import { GamificationTagCategory } from "../model/gamification-tag.model";
import { AppError } from "../../../utils/AppError";

export interface GamificationTagInput {
  name: string;
  description?: string | null;
  category: GamificationTagCategory;
  created_by?: string | null;
}

export const paginateGamificationTagsService = async (
  page: number,
  limit: number,
  filters: { search?: string; category?: GamificationTagCategory }
) => {
  return GamificationTagRepository.paginateTags(page, limit, filters);
};

export const addGamificationTagService = async (data: GamificationTagInput) => {
  return GamificationTagRepository.create({
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    created_by: data.created_by ?? null,
  });
};

export const updateGamificationTagService = async (
  id: string,
  data: Partial<GamificationTagInput>
) => {
  const updated = await GamificationTagRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("Gamification tag not found", 404);
  }
  return updated;
};

export const deleteGamificationTagService = async (id: string) => {
  const tag = await GamificationTagRepository.findByPk(id);
  if (!tag) {
    throw new AppError("Gamification tag not found", 404);
  }
  await GamificationTagRepository.deleteByPk(id);
  return null;
};
