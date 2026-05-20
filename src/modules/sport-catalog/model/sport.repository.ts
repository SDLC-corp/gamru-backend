import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import Sport from "./sport.model";

class SportRepository extends BaseRepository<Sport> {
  constructor() {
    super(Sport);
  }

  async paginateSports(
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

export default new SportRepository();
