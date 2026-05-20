import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import CustomTrigger from "./custom-trigger.model";

export interface CustomTriggerFilter {
  search?: string;
  trigger?: string;
  status?: string;
  tag?: string;
  archived?: boolean;
}

class CustomTriggerRepository extends BaseRepository<CustomTrigger> {
  constructor() {
    super(CustomTrigger);
  }

  private buildWhere(filter: CustomTriggerFilter): WhereOptions {
    const where: Record<string, unknown> = {
      is_archived: filter.archived ?? false,
    };

    if (filter.trigger) where.trigger = filter.trigger;
    if (filter.status) where.status = filter.status;

    const and: unknown[] = [];

    if (filter.search) {
      and.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${filter.search}%` } },
          { description: { [Op.iLike]: `%${filter.search}%` } },
          { trigger: { [Op.iLike]: `%${filter.search}%` } },
          { created_by: { [Op.iLike]: `%${filter.search}%` } },
        ],
      });
    }

    if (filter.tag) {
      and.push({ tags: { [Op.contains]: [filter.tag] } });
    }

    if (and.length) where[Op.and as unknown as string] = and;

    return where as WhereOptions;
  }

  async paginateCustomTriggers(
    page: number,
    limit: number,
    filter: CustomTriggerFilter
  ) {
    return this.paginate(page, limit, this.buildWhere(filter));
  }

  async listCustomTriggers(filter: CustomTriggerFilter) {
    return this.findWhere(this.buildWhere(filter), {
      order: [["created_at", "DESC"]],
    });
  }
}

export default new CustomTriggerRepository();
