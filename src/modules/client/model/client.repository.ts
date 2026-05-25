import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import Client from "./client.model";

class ClientRepository extends BaseRepository<Client> {
  constructor() {
    super(Client);
  }

  async findBySlug(slug: string) {
    return this.findOne({ slug });
  }

  async findBySkinId(skin_id: string) {
    return this.findOne({ skin_id });
  }

  async findByAuthKey(auth_key: string) {
    return this.findOne({ auth_key });
  }

  async paginateClients(params: {
    page: number;
    limit: number;
    search?: string;
    status?: "ENABLED" | "DISABLED";
  }) {
    const { page, limit, search, status } = params;

    const where: WhereOptions = {};
    if (status) (where as Record<string, unknown>).status = status;
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { name: { [Op.iLike]: term } },
        { slug: { [Op.iLike]: term } },
        { skin_id: { [Op.iLike]: term } },
      ];
    }

    return this.paginate(page, limit, where);
  }

  async touchLastSeen(id: string) {
    return this.updateByPk(id, { last_seen_at: new Date() });
  }
}

export default new ClientRepository();
