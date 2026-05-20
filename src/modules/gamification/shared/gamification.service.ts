import { GamificationEntity } from "./gamification.model";
import {
  GamificationRepository,
  GamificationFilters,
} from "./gamification.repository";
import { AppError } from "../../../utils/AppError";

export interface GamificationInput {
  name: string;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  priority?: number;
  tags?: string[];
  data?: Record<string, unknown>;
  created_by?: string | null;
}

/**
 * Each feature gets its own service instance bound to its model so
 * the rest of the codebase keeps the familiar repo/service layering.
 */
export class GamificationService {
  private repo: GamificationRepository;
  private label: string;

  constructor(model: typeof GamificationEntity, label: string) {
    this.repo = new GamificationRepository(model);
    this.label = label;
  }

  paginate(page: number, limit: number, filters: GamificationFilters) {
    return this.repo.paginateEntities(page, limit, filters);
  }

  get(id: string) {
    return this.repo.findByPk(id);
  }

  create(data: GamificationInput) {
    return this.repo.create({
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "INACTIVE",
      priority: data.priority ?? 0,
      tags: data.tags ?? [],
      data: data.data ?? {},
      created_by: data.created_by ?? null,
    });
  }

  async update(id: string, data: Partial<GamificationInput>) {
    const updated = await this.repo.updateByPk(id, data);
    if (!updated) throw new AppError(`${this.label} not found`, 404);
    return updated;
  }

  async setArchived(id: string, archived: boolean) {
    const updated = await this.repo.updateByPk(id, { archived });
    if (!updated) throw new AppError(`${this.label} not found`, 404);
    return updated;
  }

  async remove(id: string) {
    const ok = await this.repo.deleteByPk(id);
    if (!ok) throw new AppError(`${this.label} not found`, 404);
    return null;
  }
}
