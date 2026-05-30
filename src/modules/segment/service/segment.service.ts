import SegmentRepository, {
  SegmentFilter,
} from "../model/segment.repository";
import { Segment, SegmentType } from "../model/segment.model";
import { AppError } from "../../../utils/AppError";
import playerRepository from "../../player/model/player.repository";
import {
  buildSegmentWhere,
  SegmentContent,
  SEGMENT_FIELDS,
  OPERATORS_BY_KIND,
} from "./segment-rules";

export interface SegmentInput {
  name: string;
  type?: SegmentType;
  description?: string | null;
  tags?: string[] | null;
  content?: Record<string, unknown> | null;
  player_count?: number;
}

/** Count the players matching a segment rule tree. */
export const countSegmentAudience = async (
  content: SegmentContent | null | undefined
): Promise<number> => {
  const where = buildSegmentWhere(content);
  return playerRepository.count(where);
};

/** Live audience preview used by the builder while editing a rule tree. */
export const previewSegmentService = async (
  content: SegmentContent | null | undefined
): Promise<{ count: number }> => {
  return { count: await countSegmentAudience(content) };
};

/** Distinct player tags used to populate the builder's Tag-rule dropdown. */
export const listSegmentTagsService = async (): Promise<string[]> => {
  return playerRepository.listDistinctTags();
};

/** The field catalog + operator map the builder renders its dropdowns from. */
export const getSegmentFieldsService = () => {
  const fields = Object.entries(SEGMENT_FIELDS).map(([key, def]) => ({
    key,
    label: def.label,
    group: def.group,
    kind: def.kind,
    options: def.options ?? null,
    operators: OPERATORS_BY_KIND[def.kind],
  }));
  return { fields, operators: OPERATORS_BY_KIND };
};

export const createSegmentService = async (
  input: SegmentInput,
  createdBy?: string
) => {
  // Compute the audience from the rule tree at save time so the list view
  // shows a real count immediately. Never let a bad rule block the save.
  let count = input.player_count ?? 0;
  try {
    count = await countSegmentAudience(input.content as SegmentContent | null);
  } catch (err) {
    console.error("Segment audience count failed on create:", err);
  }

  return SegmentRepository.create({
    ...input,
    player_count: count,
    last_counted_at: new Date(),
    created_by: createdBy ?? null,
  } as Partial<Segment["_creationAttributes"]>);
};

export const paginateSegmentsService = async (
  page: number,
  limit: number,
  filter: SegmentFilter
) => {
  const result = await SegmentRepository.paginateSegments(page, limit, filter);
  // Counts are computed live so the list is always accurate, regardless of
  // whether a background recount has landed since the last player change.
  const data = await Promise.all(
    result.data.map(async (seg) => {
      let player_count = seg.player_count;
      try {
        player_count = await countSegmentAudience(
          seg.content as SegmentContent | null
        );
      } catch (err) {
        console.error(`Live count failed for segment ${seg.id}:`, err);
      }
      return { ...seg.toJSON(), player_count };
    })
  );
  return { ...result, data };
};

export const getSegmentService = async (id: string) => {
  const segment = await SegmentRepository.findByPk(id);
  if (!segment) {
    throw new AppError("Segment not found", 404);
  }
  let player_count = segment.player_count;
  try {
    player_count = await countSegmentAudience(
      segment.content as SegmentContent | null
    );
  } catch (err) {
    console.error(`Live count failed for segment ${id}:`, err);
  }
  return { ...segment.toJSON(), player_count };
};

/** Paginated list of the actual players matching a segment's rule tree. */
export const getSegmentPlayersService = async (
  id: string,
  page: number,
  limit: number
) => {
  const segment = await SegmentRepository.findByPk(id);
  if (!segment) {
    throw new AppError("Segment not found", 404);
  }
  const where = buildSegmentWhere(segment.content as SegmentContent | null);
  return playerRepository.paginate(page, limit, where, [
    ["registration_date", "DESC"],
  ]);
};

export const updateSegmentService = async (
  id: string,
  data: Partial<SegmentInput>
) => {
  const patch: Partial<Segment["_creationAttributes"]> = {
    ...data,
  } as Partial<Segment["_creationAttributes"]>;

  // Recompute the audience whenever the rule tree changes.
  if (data.content !== undefined) {
    try {
      patch.player_count = await countSegmentAudience(
        data.content as SegmentContent | null
      );
      patch.last_counted_at = new Date();
    } catch (err) {
      console.error("Segment audience count failed on update:", err);
    }
  } else if (data.player_count != null) {
    patch.last_counted_at = new Date();
  }

  const updated = await SegmentRepository.updateByPk(id, patch);
  if (!updated) {
    throw new AppError("Segment not found", 404);
  }
  return updated;
};

/**
 * Recompute `player_count` for every non-archived DYNAMIC segment. Called
 * (best-effort, fire-and-forget) whenever the player population changes — e.g.
 * a new game-platform registration creates a player — so segment counts like
 * "New players" stay live without a background scheduler.
 */
export const recomputeDynamicSegmentCounts = async (): Promise<void> => {
  const segments = await SegmentRepository.findWhere({
    is_archived: false,
    type: "DYNAMIC",
  });
  const now = new Date();
  for (const segment of segments) {
    try {
      const count = await countSegmentAudience(
        segment.content as SegmentContent | null
      );
      await SegmentRepository.updateByPk(segment.id, {
        player_count: count,
        last_counted_at: now,
      } as Partial<Segment["_creationAttributes"]>);
    } catch (err) {
      console.error(`Recount failed for segment ${segment.id}:`, err);
    }
  }
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
