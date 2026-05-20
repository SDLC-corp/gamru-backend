import { Op, WhereOptions, fn, col } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import Segment from "./segment.model";

export interface SegmentFilter {
  search?: string;
  type?: string;
  created_by?: string;
  tag?: string;
  archived?: boolean;
}

class SegmentRepository extends BaseRepository<Segment> {
  constructor() {
    super(Segment);
  }

  private buildWhere(filter: SegmentFilter): WhereOptions {
    const where: Record<string, unknown> = {
      is_archived: filter.archived ?? false,
    };

    if (filter.type) where.type = filter.type;
    if (filter.created_by) where.created_by = filter.created_by;

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

  async paginateSegments(page: number, limit: number, filter: SegmentFilter) {
    return this.paginate(page, limit, this.buildWhere(filter));
  }

  async listSegments(filter: SegmentFilter) {
    return this.findWhere(this.buildWhere(filter), {
      order: [["created_at", "DESC"]],
    });
  }

  /** Distinct, non-null `created_by` values — feeds the "Created By" filter. */
  async listCreators(): Promise<string[]> {
    const rows = await this.model.findAll({
      attributes: [[fn("DISTINCT", col("created_by")), "created_by"]],
      where: { created_by: { [Op.ne]: null } },
      raw: true,
    });
    return (rows as unknown as { created_by: string | null }[])
      .map((r) => r.created_by)
      .filter((v): v is string => Boolean(v))
      .sort((a, b) => a.localeCompare(b));
  }
}

export default new SegmentRepository();
