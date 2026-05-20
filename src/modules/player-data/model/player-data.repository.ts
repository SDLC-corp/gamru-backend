import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import PlayerData from "./player-data.model";

export interface PlayerDataFilter {
  search?: string;
  data_type?: string;
  is_custom?: boolean;
}

class PlayerDataRepository extends BaseRepository<PlayerData> {
  constructor() {
    super(PlayerData);
  }

  private buildWhere(filter: PlayerDataFilter): WhereOptions {
    const where: Record<string, unknown> = {};

    if (typeof filter.is_custom === "boolean") {
      where.is_custom = filter.is_custom;
    }
    if (filter.data_type) where.data_type = filter.data_type;
    if (filter.search) {
      where.name = { [Op.iLike]: `%${filter.search}%` };
    }

    return where as WhereOptions;
  }

  async paginatePlayerData(
    page: number,
    limit: number,
    filter: PlayerDataFilter
  ) {
    return this.paginate(page, limit, this.buildWhere(filter), [
      ["created_at", "ASC"],
    ]);
  }
}

export default new PlayerDataRepository();
