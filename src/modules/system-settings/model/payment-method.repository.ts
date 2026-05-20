import { BaseRepository } from "../../../core/models/base.repository";
import PaymentMethod from "./payment-method.model";

class PaymentMethodRepository extends BaseRepository<PaymentMethod> {
  constructor() {
    super(PaymentMethod);
  }

  async findAllOrdered() {
    return this.model.findAll({ order: [["created_at", "ASC"]] });
  }

  async deleteAll() {
    return this.model.destroy({ where: {}, truncate: false });
  }
}

export default new PaymentMethodRepository();
