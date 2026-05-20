import TemplateRepository, {
  TemplateFilter,
} from "../model/template.repository";
import { Template, TemplateChannel } from "../model/template.model";
import { AppError } from "../../../utils/AppError";

export interface TemplateInput {
  name: string;
  channel: TemplateChannel;
  description?: string | null;
  language?: string | null;
  tags?: string[] | null;
  subject?: string | null;
  content?: string | null;
  test_recipients?: string[] | null;
}

export const createTemplateService = async (
  input: TemplateInput,
  createdBy?: string
) => {
  return TemplateRepository.create({
    ...input,
    created_by: createdBy ?? null,
  } as Partial<Template["_creationAttributes"]>);
};

export const paginateTemplatesService = async (
  page: number,
  limit: number,
  filter: TemplateFilter
) => {
  return TemplateRepository.paginateTemplates(page, limit, filter);
};

export const getTemplateService = async (id: string) => {
  const template = await TemplateRepository.findByPk(id);
  if (!template) {
    throw new AppError("Template not found", 404);
  }
  return template;
};

export const updateTemplateService = async (
  id: string,
  data: Partial<TemplateInput>
) => {
  const updated = await TemplateRepository.updateByPk(
    id,
    data as Partial<Template["_creationAttributes"]>
  );
  if (!updated) {
    throw new AppError("Template not found", 404);
  }
  return updated;
};

export const archiveTemplateService = async (id: string) => {
  const updated = await TemplateRepository.updateByPk(id, {
    is_archived: true,
  });
  if (!updated) {
    throw new AppError("Template not found", 404);
  }
  return updated;
};

export const restoreTemplateService = async (id: string) => {
  const updated = await TemplateRepository.updateByPk(id, {
    is_archived: false,
  });
  if (!updated) {
    throw new AppError("Template not found", 404);
  }
  return updated;
};

export const deleteTemplateService = async (id: string) => {
  const deleted = await TemplateRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Template not found", 404);
  }
  return null;
};
