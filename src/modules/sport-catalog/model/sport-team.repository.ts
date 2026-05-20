import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import SportTeam from "./sport-team.model";

class SportTeamRepository extends BaseRepository<SportTeam> {
  constructor() {
    super(SportTeam);
  }

  async paginateTeams(
    page: number,
    limit: number,
    filters: { search?: string; sport?: string; tournament?: string }
  ) {
    const and: WhereOptions[] = [];

    if (filters.sport) {
      and.push({ sport: filters.sport });
    }

    if (filters.tournament) {
      and.push({ tournament: filters.tournament });
    }

    if (filters.search) {
      and.push({ name: { [Op.iLike]: `%${filters.search}%` } });
    }

    const where: WhereOptions | undefined =
      and.length > 0 ? { [Op.and]: and } : undefined;

    return this.paginate(page, limit, where);
  }
}

export default new SportTeamRepository();
