import SegmentRepository, {
  SegmentFilter,
} from "../model/segment.repository";
import { Segment, SegmentType } from "../model/segment.model";
import { AppError } from "../../../utils/AppError";

export interface SegmentInput {
  name: string;
  type?: SegmentType;
  description?: string | null;
  tags?: string[] | null;
  content?: Record<string, unknown> | null;
  player_count?: number;
}

export const createSegmentService = async (
  input: SegmentInput,
  createdBy?: string
) => {
  return SegmentRepository.create({
    ...input,
    last_counted_at: input.player_count != null ? new Date() : null,
    created_by: createdBy ?? null,
  } as Partial<Segment["_creationAttributes"]>);
};

export const paginateSegmentsService = async (
  page: number,
  limit: number,
  filter: SegmentFilter
) => {
  return SegmentRepository.paginateSegments(page, limit, filter);
};

export const getSegmentService = async (id: string) => {
  const segment = await SegmentRepository.findByPk(id);
  if (!segment) {
    throw new AppError("Segment not found", 404);
  }
  return segment;
};

export const updateSegmentService = async (
  id: string,
  data: Partial<SegmentInput>
) => {
  const patch: Partial<Segment["_creationAttributes"]> = {
    ...data,
  } as Partial<Segment["_creationAttributes"]>;

  if (data.player_count != null) {
    patch.last_counted_at = new Date();
  }

  const updated = await SegmentRepository.updateByPk(id, patch);
  if (!updated) {
    throw new AppError("Segment not found", 404);
  }
  return updated;
};

export const archiveSegmentService = async (id: string) => {
  const updated = await SegmentRepository.updateByPk(id, {
    is_archived: true,
  });
  if (!updated) {
    throw new AppError("Segment not found", 404);
  }
  return updated;
};

export const restoreSegmentService = async (id: string) => {
  const updated = await SegmentRepository.updateByPk(id, {
    is_archived: false,
  });
  if (!updated) {
    throw new AppError("Segment not found", 404);
  }
  return updated;
};

export const deleteSegmentService = async (id: string) => {
  const deleted = await SegmentRepository.deleteByPk(id);
  if (!deleted) {
    throw new AppError("Segment not found", 404);
  }
  return null;
};

export const listSegmentCreatorsService = async () => {
  return SegmentRepository.listCreators();
};
