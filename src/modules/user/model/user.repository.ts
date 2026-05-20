import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import User from "./user.model";

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async updateAccessTokens(id: string, tokens: { access_token?: string | null; refresh_token?: string | null }) {
    const user = await this.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    await user.update(tokens);
  }
  
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return (User as any).scope("withPassword").findOne({
      where: { email },
    });
  }

  async findByPkWithPassword(id: string): Promise<User | null> {
    return (User as any).scope("withPassword").findByPk(id);
  }

  async findAllUsers(): Promise<User[]> {
    return this.findWhere({ role: "USER" } as WhereOptions);
  }

  async paginateUsers(page: number, limit: number) {
    return this.paginate(page, limit, { role: { [Op.ne]: "ADMIN" } } as WhereOptions);
  }
}

export default new UserRepository();
