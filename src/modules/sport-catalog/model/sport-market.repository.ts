import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import SportMarket from "./sport-market.model";

class SportMarketRepository extends BaseRepository<SportMarket> {
  constructor() {
    super(SportMarket);
  }

  async paginateMarkets(
    page: number,
    limit: number,
    filters: { search?: string }
  ) {
    let where: WhereOptions | undefined;

    if (filters.search) {
      where = { name: { [Op.iLike]: `%${filters.search}%` } };
    }

    return this.paginate(page, limit, where);
  }
}

export default new SportMarketRepository();
