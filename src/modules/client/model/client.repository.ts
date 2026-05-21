import { BaseRepository } from "../../../core/models/base.repository";
import Client from "./client.model";

class ClientRepository extends BaseRepository<Client> {
  constructor() {
    super(Client);
  }

  /** Look up a client by its public `client_id` header value. */
  async findByClientId(client_id: string) {
    return this.findOne({ client_id });
  }

  /** Look up a client by its url-safe slug. */
  async findBySlug(slug: string) {
    return this.findOne({ slug });
  }

  /**
   * Variant of `findByClientId` that includes the secret hash so the
   * auth middleware can verify it. Default scope excludes secrets.
   */
  async findByClientIdWithSecret(client_id: string) {
    return Client.scope("withSecret").findOne({ where: { client_id } });
  }
}

export default new ClientRepository();
