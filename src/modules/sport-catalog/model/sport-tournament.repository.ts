import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import SportTournament from "./sport-tournament.model";

class SportTournamentRepository extends BaseRepository<SportTournament> {
  constructor() {
    super(SportTournament);
  }

  async paginateTournaments(
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

export default new SportTournamentRepository();
