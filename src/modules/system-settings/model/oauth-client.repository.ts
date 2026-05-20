import { BaseRepository } from "../../../core/models/base.repository";
import OAuthClient from "./oauth-client.model";

class OAuthClientRepository extends BaseRepository<OAuthClient> {
  constructor() {
    super(OAuthClient);
  }

  async findAllOrdered() {
    return this.model.findAll({ order: [["created_at", "DESC"]] });
  }

  async findByClientId(client_id: string) {
    return this.findOne({ client_id });
  }
}

export default new OAuthClientRepository();
