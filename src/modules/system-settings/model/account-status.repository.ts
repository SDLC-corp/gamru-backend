import { BaseRepository } from "../../../core/models/base.repository";
import AccountStatus from "./account-status.model";

class AccountStatusRepository extends BaseRepository<AccountStatus> {
  constructor() {
    super(AccountStatus);
  }

  async findAllOrdered() {
    return this.model.findAll({ order: [["created_at", "ASC"]] });
  }

  async deleteAll() {
    return this.model.destroy({ where: {}, truncate: false });
  }
}

export default new AccountStatusRepository();
