import {
  Model,
  ModelStatic,
  WhereOptions,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  Order,
} from "sequelize";

export class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll({
      order: [["created_at", "DESC"]],
      ...options,
    });
  }

  async findByPk(id: string | number): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async findOne(where: WhereOptions): Promise<T | null> {
    return this.model.findOne({ where });
  }

  async findWhere(where: WhereOptions, options?: FindOptions): Promise<T[]> {
    return this.model.findAll({ where, ...options });
  }

  async count(where?: WhereOptions): Promise<number> {
    return this.model.count({ where });
  }

  async findAndCountAll(
    options?: FindOptions
  ): Promise<{ rows: T[]; count: number }> {
    return this.model.findAndCountAll({
      order: [["created_at", "DESC"]],
      ...options,
    });
  }

  async paginate(
    page = 1,
    limit = 10,
    where?: WhereOptions,
    order?: Order
  ): Promise<{
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: order ?? [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async create(data: Partial<T["_creationAttributes"]>, options?: CreateOptions): Promise<T> {
    return this.model.create(data as T["_creationAttributes"], options);
  }

  async bulkCreate(
    data: Array<Partial<T["_creationAttributes"]>>,
    options?: CreateOptions
  ): Promise<T[]> {
    return this.model.bulkCreate(data as T["_creationAttributes"][], options);
  }

  async updateByPk(
    id: string | number,
    data: Partial<T["_creationAttributes"]>
  ): Promise<T | null> {
    const record = await this.findByPk(id);
    if (!record) return null;
    return record.update(data);
  }

  async updateWhere(
    data: Partial<T["_creationAttributes"]>,
    where: WhereOptions,
    options?: UpdateOptions
  ): Promise<[number]> {
    return this.model.update(data as Record<string, unknown>, {
      where,
      ...options,
    }) as unknown as [number];
  }

  async deleteByPk(id: string | number): Promise<boolean> {
    const record = await this.findByPk(id);
    if (!record) return false;
    await record.destroy();
    return true;
  }

  async deleteWhere(
    where: WhereOptions,
    options?: DestroyOptions
  ): Promise<number> {
    return this.model.destroy({ where, ...options });
  }
}
