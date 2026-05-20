import { BaseRepository } from "../../../core/models/base.repository";
import Role from "./role.model";

class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role);
  }

  async findByName(name: string) {
    return this.findOne({ name });
  }

  async findAllRoles() {
    return this.findAll();
  }

  async paginateRoles(page: number, limit: number) {
    return this.paginate(page, limit);
  }
}

export default new RoleRepository();