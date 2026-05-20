import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import CampaignHistory from "./campaign-history.model";

export interface HistoryFilter {
  search?: string;
  status?: string;
  channel?: string;
  from?: Date;
}

class CampaignHistoryRepository extends BaseRepository<CampaignHistory> {
  constructor() {
    super(CampaignHistory);
  }

  buildWhere(filter: HistoryFilter): WhereOptions {
    const where: Record<string, unknown> = {};

    if (filter.status) where.status = filter.status;
    if (filter.channel) where.channel = filter.channel;
    if (filter.from) where.event_date = { [Op.gte]: filter.from };

    if (filter.search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${filter.search}%` } },
        { player_id: { [Op.iLike]: `%${filter.search}%` } },
      ];
    }

    return where as WhereOptions;
  }

  async paginateHistory(page: number, limit: number, filter: HistoryFilter) {
    return this.paginate(page, limit, this.buildWhere(filter), [
      ["event_date", "DESC"],
    ]);
  }
}

export default new CampaignHistoryRepository();
