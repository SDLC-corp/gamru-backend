import CrmTagRepository from "../model/crm-tag.repository";
import { CrmTagCategory } from "../model/crm-tag.model";
import { AppError } from "../../../utils/AppError";

export interface CrmTagInput {
  name: string;
  description?: string | null;
  category: CrmTagCategory;
  created_by?: string | null;
}

export const paginateCrmTagsService = async (
  page: number,
  limit: number,
  filters: { search?: string; category?: CrmTagCategory }
) => {
  return CrmTagRepository.paginateTags(page, limit, filters);
};

export const addCrmTagService = async (data: CrmTagInput) => {
  return CrmTagRepository.create({
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    created_by: data.created_by ?? null,
  });
};

export const updateCrmTagService = async (
  id: string,
  data: Partial<CrmTagInput>
) => {
  const updated = await CrmTagRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("CRM tag not found", 404);
  }
  return updated;
};

export const deleteCrmTagService = async (id: string) => {
  const tag = await CrmTagRepository.findByPk(id);
  if (!tag) {
    throw new AppError("CRM tag not found", 404);
  }
  await CrmTagRepository.deleteByPk(id);
  return null;
};
