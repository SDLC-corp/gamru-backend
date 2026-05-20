import sequelize from "../../../config/db";
import LanguageRepository from "../model/language.repository";
import { AppError } from "../../../utils/AppError";

export interface LanguageInput {
  language: string;
  flag?: string | null;
  flag_emoji?: string | null;
  is_default?: boolean;
}

export const listLanguagesService = async () => {
  return LanguageRepository.findAllOrdered();
};

export const getLanguageService = async (id: string) => {
  const row = await LanguageRepository.findByPk(id);
  if (!row) throw new AppError("Language not found", 404);
  return row;
};

export const createLanguageService = async (data: LanguageInput) => {
  if (data.is_default) await LanguageRepository.clearDefaults();
  return LanguageRepository.create(data);
};

export const updateLanguageService = async (id: string, data: Partial<LanguageInput>) => {
  if (data.is_default) await LanguageRepository.clearDefaults();
  const updated = await LanguageRepository.updateByPk(id, data);
  if (!updated) throw new AppError("Language not found", 404);
  return updated;
};

export const deleteLanguageService = async (id: string) => {
  const ok = await LanguageRepository.deleteByPk(id);
  if (!ok) throw new AppError("Language not found", 404);
  return null;
};

export const replaceLanguagesService = async (items: LanguageInput[]) => {
  return sequelize.transaction(async (t) => {
    await LanguageRepository.deleteWhere({}, { transaction: t });
    if (items.length === 0) return [];
    return LanguageRepository.bulkCreate(items, { transaction: t });
  });
};
