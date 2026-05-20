import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import CasinoGame from "./casino-game.model";

class CasinoGameRepository extends BaseRepository<CasinoGame> {
  constructor() {
    super(CasinoGame);
  }

  async paginateGames(
    page: number,
    limit: number,
    filters: { search?: string; provider?: string; category?: string }
  ) {
    const and: WhereOptions[] = [];

    if (filters.provider) {
      and.push({ provider: filters.provider });
    }

    if (filters.category) {
      and.push({ category: filters.category });
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      and.push({
        [Op.or]: [
          { id: { [Op.iLike]: term } },
          { name: { [Op.iLike]: term } },
        ],
      });
    }

    const where: WhereOptions | undefined =
      and.length > 0 ? { [Op.and]: and } : undefined;

    return this.paginate(page, limit, where);
  }
}

export default new CasinoGameRepository();
