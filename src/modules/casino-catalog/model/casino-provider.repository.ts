import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import CasinoProvider from "./casino-provider.model";

class CasinoProviderRepository extends BaseRepository<CasinoProvider> {
  constructor() {
    super(CasinoProvider);
  }

  async paginateProviders(
    page: number,
    limit: number,
    filters: { search?: string }
  ) {
    let where: WhereOptions | undefined;

    if (filters.search) {
      const term = `%${filters.search}%`;
      where = {
        [Op.or]: [
          { id: { [Op.iLike]: term } },
          { name: { [Op.iLike]: term } },
        ],
      };
    }

    return this.paginate(page, limit, where);
  }
}

export default new CasinoProviderRepository();
