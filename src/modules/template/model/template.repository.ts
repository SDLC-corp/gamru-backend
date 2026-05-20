import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import Template from "./template.model";

export interface TemplateFilter {
  search?: string;
  channel?: string;
  language?: string;
  tag?: string;
  archived?: boolean;
}

class TemplateRepository extends BaseRepository<Template> {
  constructor() {
    super(Template);
  }

  private buildWhere(filter: TemplateFilter): WhereOptions {
    const where: Record<string, unknown> = {
      is_archived: filter.archived ?? false,
    };

    if (filter.channel) where.channel = filter.channel;
    if (filter.language) where.language = filter.language;

    const and: unknown[] = [];

    if (filter.search) {
      and.push({
        [Op.or]: [
          { name: { [Op.iLike]: `%${filter.search}%` } },
          { description: { [Op.iLike]: `%${filter.search}%` } },
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

  async paginateTemplates(
    page: number,
    limit: number,
    filter: TemplateFilter
  ) {
    return this.paginate(page, limit, this.buildWhere(filter));
  }

  async listTemplates(filter: TemplateFilter) {
    return this.findWhere(this.buildWhere(filter), {
      order: [["created_at", "DESC"]],
    });
  }
}

export default new TemplateRepository();
