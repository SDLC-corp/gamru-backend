import FrequencyCapRepository, {
  FrequencyCapFilter,
} from "../model/frequency-cap.repository";
import {
  FrequencyCap,
  FrequencyCapChannel,
  FrequencyCapPeriod,
} from "../model/frequency-cap.model";
import { AppError } from "../../../utils/AppError";

export interface FrequencyCapInput {
  channel: FrequencyCapChannel;
  period: FrequencyCapPeriod;
  limit: number;
}

export const createFrequencyCapService = async (
  input: FrequencyCapInput,
  createdBy?: string
) => {
  return FrequencyCapRepository.create({
    ...input,
    created_by: createdBy ?? null,
  } as Partial<FrequencyCap["_creationAttributes"]>);
};

export const paginateFrequencyCapsService = async (
  page: number,
  limit: number,
  filter: FrequencyCapFilter
) => {
  return FrequencyCapRepository.paginateFrequencyCaps(page, limit, filter);
};

export const getFrequencyCapService = async (id: string) => {
  const cap = await FrequencyCapRepository.findByPk(id);
  if (!cap) {
    throw new AppError("Frequency cap not found", 404);
  }
  return cap;
};

export const updateFrequencyCapService = async (
  id: string,
  data: Partial<FrequencyCapInput>
) => {
  const updated = await FrequencyCapRepository.updateByPk(
    id,
    data as Partial<FrequencyCap["_creationAttributes"]>
  );
  if (!updated) {
    throw new AppError("Frequency cap not found", 404);
  }
  return updated;
};

export const deleteFrequencyCapService = async (id: string) => {
  const deleted = await FrequencyCapRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Frequency cap not found", 404);
  }
  return null;
};
