import PlayerDataRepository, {
  PlayerDataFilter,
} from "../model/player-data.repository";
import { PlayerData, PlayerDataType } from "../model/player-data.model";
import { AppError } from "../../../utils/AppError";

export interface PlayerDataInput {
  name: string;
  description?: string | null;
  data_type: PlayerDataType;
  data_option?: string | null;
}

export const createPlayerDataService = async (
  input: PlayerDataInput,
  createdBy?: string
) => {
  return PlayerDataRepository.create({
    ...input,
    is_custom: true,
    created_by: createdBy ?? null,
  } as Partial<PlayerData["_creationAttributes"]>);
};

export const bulkCreatePlayerDataService = async (
  rows: PlayerDataInput[],
  createdBy?: string
) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError("No rows to import", 400);
  }
  const payload = rows.map((r) => ({
    ...r,
    is_custom: true,
    created_by: createdBy ?? null,
  }));
  return PlayerDataRepository.bulkCreate(
    payload as Partial<PlayerData["_creationAttributes"]>[]
  );
};

export const paginatePlayerDataService = async (
  page: number,
  limit: number,
  filter: PlayerDataFilter
) => {
  return PlayerDataRepository.paginatePlayerData(page, limit, filter);
};

export const updatePlayerDataService = async (
  id: string,
  data: Partial<PlayerDataInput>
) => {
  const existing = await PlayerDataRepository.findByPk(id);
  if (!existing) {
    throw new AppError("Player data field not found", 404);
  }
  if (!existing.is_custom) {
    throw new AppError("System player data fields cannot be modified", 400);
  }
  return existing.update(data as Partial<PlayerData["_creationAttributes"]>);
};

export const deletePlayerDataService = async (id: string) => {
  const existing = await PlayerDataRepository.findByPk(id);
  if (!existing) {
    throw new AppError("Player data field not found", 404);
  }
  if (!existing.is_custom) {
    throw new AppError("System player data fields cannot be deleted", 400);
  }
  await existing.destroy();
  return null;
};
