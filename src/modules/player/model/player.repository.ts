import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import Player from "./player.model";
import PlayerCampaignHistory from "./player-campaign-history.model";
import PlayerReward from "./player-reward.model";
import PlayerLog from "./player-log.model";

export type PlayerSearchField =
  | "all"
  | "name"
  | "email"
  | "username"
  | "player_id";

export interface PlayerFilter {
  search?: string;
  status?: string;
  country?: string;
  field?: PlayerSearchField;
}

const PLAYER_SEARCH_FIELDS: Record<Exclude<PlayerSearchField, "all">, string> = {
  name: "name",
  email: "email",
  username: "username",
  player_id: "player_id",
};

class PlayerRepository extends BaseRepository<Player> {
  constructor() {
    super(Player);
  }

  private buildWhere(filter: PlayerFilter): WhereOptions {
    const where: Record<string, unknown> = {};

    if (filter.status) where.status = filter.status;
    if (filter.country) where.country = filter.country;

    if (filter.search) {
      const like = { [Op.iLike]: `%${filter.search}%` };
      if (filter.field && filter.field !== "all" && PLAYER_SEARCH_FIELDS[filter.field]) {
        where[PLAYER_SEARCH_FIELDS[filter.field]] = like;
      } else {
        where[Op.or as unknown as string] = [
          { player_id: like },
          { username: like },
          { name: like },
          { email: like },
        ];
      }
    }

    return where as WhereOptions;
  }

  async paginatePlayers(page: number, limit: number, filter: PlayerFilter) {
    return this.paginate(page, limit, this.buildWhere(filter));
  }
}

export const playerRepository = new PlayerRepository();

class PlayerCampaignHistoryRepository extends BaseRepository<PlayerCampaignHistory> {
  constructor() {
    super(PlayerCampaignHistory);
  }

  async paginateForPlayer(
    playerId: string,
    page: number,
    limit: number,
    search?: string
  ) {
    const where: Record<string, unknown> = { player_id: playerId };
    if (search) where.title = { [Op.iLike]: `%${search}%` };
    return this.paginate(page, limit, where as WhereOptions, [
      ["event_at", "DESC"],
    ]);
  }
}

export const playerCampaignHistoryRepository =
  new PlayerCampaignHistoryRepository();

class PlayerRewardRepository extends BaseRepository<PlayerReward> {
  constructor() {
    super(PlayerReward);
  }

  async paginateForPlayer(playerId: string, page: number, limit: number) {
    return this.paginate(
      page,
      limit,
      { player_id: playerId } as WhereOptions,
      [["created_at", "DESC"]]
    );
  }
}

export const playerRewardRepository = new PlayerRewardRepository();

class PlayerLogRepository extends BaseRepository<PlayerLog> {
  constructor() {
    super(PlayerLog);
  }

  async paginateForPlayer(playerId: string, page: number, limit: number) {
    return this.paginate(
      page,
      limit,
      { player_id: playerId } as WhereOptions,
      [["created_at", "DESC"]]
    );
  }
}

export const playerLogRepository = new PlayerLogRepository();

export default playerRepository;
