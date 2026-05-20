import { BaseRepository } from "../../../core/models/base.repository";
import Webhook from "./webhook.model";

class WebhookRepository extends BaseRepository<Webhook> {
  constructor() {
    super(Webhook);
  }

  async findAllOrdered() {
    return this.model.findAll({ order: [["created_at", "DESC"]] });
  }
}

export default new WebhookRepository();
