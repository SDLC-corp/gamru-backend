import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import FrequencyCap from "./frequency-cap.model";

export interface FrequencyCapFilter {
  search?: string;
  channel?: string;
  period?: string;
}

class FrequencyCapRepository extends BaseRepository<FrequencyCap> {
  constructor() {
    super(FrequencyCap);
  }

  private buildWhere(filter: FrequencyCapFilter): WhereOptions {
    const where: Record<string, unknown> = {};

    if (filter.channel) where.channel = filter.channel;
    if (filter.period) where.period = filter.period;
    if (filter.search) {
      where.channel = { [Op.iLike]: `%${filter.search}%` };
    }

    return where as WhereOptions;
  }

  async paginateFrequencyCaps(
    page: number,
    limit: number,
    filter: FrequencyCapFilter
  ) {
    return this.paginate(page, limit, this.buildWhere(filter));
  }
}

export default new FrequencyCapRepository();
