import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import { GamificationEntity } from "./gamification.model";

export interface GamificationFilters {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  archived?: boolean;
  tag?: string;
}

export class GamificationRepository extends BaseRepository<GamificationEntity> {
  constructor(model: typeof GamificationEntity) {
    super(model);
  }

  async paginateEntities(
    page: number,
    limit: number,
    filters: GamificationFilters
  ) {
    const and: WhereOptions[] = [
      { archived: filters.archived ?? false },
    ];

    if (filters.status) {
      and.push({ status: filters.status });
    }

    if (filters.tag) {
      and.push({ tags: { [Op.contains]: [filters.tag] } });
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

    return this.paginate(page, limit, { [Op.and]: and }, [
      ["priority", "DESC"],
      ["created_at", "DESC"],
    ]);
  }
}
