import { Op, WhereOptions } from "sequelize";
import { BaseRepository } from "../../../core/models/base.repository";
import User from "./user.model";

export type UserSearchField =
  | "all"
  | "name"
  | "email"
  | "username"
  | "mobile";

export interface UserFilter {
  search?: string;
  field?: UserSearchField;
}

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

  async paginateUsers(page: number, limit: number, filter: UserFilter = {}) {
    const where: Record<string, unknown> = { role: { [Op.ne]: "ADMIN" } };

    if (filter.search) {
      const like = { [Op.iLike]: `%${filter.search}%` };
      const field = filter.field ?? "all";

      if (field === "name") {
        where[Op.or as unknown as string] = [
          { first_name: like },
          { last_name: like },
        ];
      } else if (field === "email") {
        where.email = like;
      } else if (field === "username") {
        where.username = like;
      } else if (field === "mobile") {
        where.mobile = like;
      } else {
        where[Op.or as unknown as string] = [
          { first_name: like },
          { last_name: like },
          { email: like },
          { username: like },
          { mobile: like },
        ];
      }
    }

    return this.paginate(page, limit, where as WhereOptions);
  }
}

export default new UserRepository();
