import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import CrmTag, { CrmTagCategory } from "./crm-tag.model";

class CrmTagRepository extends BaseRepository<CrmTag> {
  constructor() {
    super(CrmTag);
  }

  async paginateTags(
    page: number,
    limit: number,
    filters: { search?: string; category?: CrmTagCategory }
  ) {
    const and: WhereOptions[] = [];

    if (filters.category) {
      and.push({ category: filters.category });
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      and.push({
        [Op.or]: [
          { name: { [Op.iLike]: term } },
          { description: { [Op.iLike]: term } },
        ],
      });
    }

    const where: WhereOptions | undefined =
      and.length > 0 ? { [Op.and]: and } : undefined;

    return this.paginate(page, limit, where);
  }
}

export default new CrmTagRepository();
