import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import UnsubscribeReport from "./unsubscribe-report.model";

export interface UnsubscribeReportFilter {
  campaign_name?: string;
  player_id?: string;
  channel?: string;
  /** Lookback window in days; omit / 0 for "Lifetime". */
  days?: number;
}

class UnsubscribeReportRepository extends BaseRepository<UnsubscribeReport> {
  constructor() {
    super(UnsubscribeReport);
  }

  private buildWhere(filter: UnsubscribeReportFilter): WhereOptions {
    const where: Record<string, unknown> = {};

    if (filter.channel) where.channel = filter.channel;
    if (filter.campaign_name) {
      where.campaign_name = { [Op.iLike]: `%${filter.campaign_name}%` };
    }
    if (filter.player_id) {
      where.player_id = { [Op.iLike]: `%${filter.player_id}%` };
    }
    if (filter.days && filter.days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - filter.days);
      where.unsubscribed_at = { [Op.gte]: since };
    }

    return where as WhereOptions;
  }

  async paginateReports(
    page: number,
    limit: number,
    filter: UnsubscribeReportFilter
  ) {
    return this.paginate(page, limit, this.buildWhere(filter), [
      ["unsubscribed_at", "DESC"],
    ]);
  }
}

export default new UnsubscribeReportRepository();
