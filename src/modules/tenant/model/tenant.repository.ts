import { BaseRepository } from "../../../core/models/base.repository";
import Tenant from "./tenant.model";

class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(Tenant);
  }

  async findActiveById(id: string): Promise<Tenant | null> {
    return Tenant.findOne({ where: { id, status: "ACTIVE" } });
  }

  async findActiveBySlug(slug: string): Promise<Tenant | null> {
    return Tenant.findOne({ where: { slug, status: "ACTIVE" } });
  }

  async findActiveBySubdomain(subdomain: string): Promise<Tenant | null> {
    return Tenant.findOne({ where: { subdomain, status: "ACTIVE" } });
  }
}

export default new TenantRepository();
