import CustomTriggerRepository, {
  CustomTriggerFilter,
} from "../model/custom-trigger.repository";
import {
  CustomTrigger,
  CustomTriggerStatus,
} from "../model/custom-trigger.model";
import { AppError } from "../../../utils/AppError";

export interface CustomTriggerInput {
  name: string;
  trigger?: string | null;
  status?: CustomTriggerStatus;
  description?: string | null;
  tags?: string[] | null;
  builder?: Record<string, unknown> | null;
}

export const createCustomTriggerService = async (
  input: CustomTriggerInput,
  createdBy?: string
) => {
  return CustomTriggerRepository.create({
    ...input,
    created_by: createdBy ?? null,
  } as Partial<CustomTrigger["_creationAttributes"]>);
};

export const paginateCustomTriggersService = async (
  page: number,
  limit: number,
  filter: CustomTriggerFilter
) => {
  return CustomTriggerRepository.paginateCustomTriggers(page, limit, filter);
};

export const getCustomTriggerService = async (id: string) => {
  const trigger = await CustomTriggerRepository.findByPk(id);
  if (!trigger) {
    throw new AppError("Custom trigger not found", 404);
  }
  return trigger;
};

export const updateCustomTriggerService = async (
  id: string,
  data: Partial<CustomTriggerInput>
) => {
  const updated = await CustomTriggerRepository.updateByPk(
    id,
    data as Partial<CustomTrigger["_creationAttributes"]>
  );
  if (!updated) {
    throw new AppError("Custom trigger not found", 404);
  }
  return updated;
};

export const archiveCustomTriggerService = async (id: string) => {
  const updated = await CustomTriggerRepository.updateByPk(id, {
    is_archived: true,
  });
  if (!updated) {
    throw new AppError("Custom trigger not found", 404);
  }
  return updated;
};

export const restoreCustomTriggerService = async (id: string) => {
  const updated = await CustomTriggerRepository.updateByPk(id, {
    is_archived: false,
  });
  if (!updated) {
    throw new AppError("Custom trigger not found", 404);
  }
  return updated;
};

export const deleteCustomTriggerService = async (id: string) => {
  const deleted = await CustomTriggerRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Custom trigger not found", 404);
  }
  return null;
};
