import { Op } from "sequelize";
import { gamificationModels } from "./gamification.model";
import { AppError } from "../../../utils/AppError";

/**
 * Rank continuity guard.
 *
 * Ranks form a single, continuous ladder: levels never restart per rank.
 * Rank&nbsp;1 owns levels 1‑3 (0&nbsp;→&nbsp;X XP), Rank&nbsp;2 continues at
 * level&nbsp;4 from where Rank&nbsp;1's XP ended, and so on. This guard is the
 * single place that enforces — on both create and update — that:
 *
 *  • a rank's name is unique (case-insensitive),
 *  • the levels inside the payload are internally consistent (consecutive
 *    level numbers, each XP window fully contiguous),
 *  • the payload continues exactly from the preceding rank (no restarted
 *    level numbers, no gaps/overlaps in the XP windows, the very first rank
 *    starting at level 1 / 0 XP),
 *  • no level number or XP window collides with another rank.
 *
 * Any violation throws an `AppError` with a clear, user-facing message.
 */

interface LevelRow {
  level: number;
  xp_start: number;
  xp_end: number;
}

interface RankPayload {
  name: string;
  data?: Record<string, unknown> | null;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

const readLevels = (data: unknown): LevelRow[] => {
  const levels = (data as Record<string, unknown> | null | undefined)?.levels;
  if (!Array.isArray(levels)) return [];
  return levels.map((l) => {
    const row = l as Record<string, unknown>;
    return {
      level: num(row.level),
      xp_start: num(row.xp_start),
      xp_end: num(row.xp_end),
    };
  });
};

interface OtherRank {
  name: string;
  levels: LevelRow[];
  minXp: number;
  maxXp: number;
  maxLevel: number;
}

/** Summarise every other (non-archived) rank's level span. */
const loadOtherRanks = async (excludeId?: string): Promise<OtherRank[]> => {
  const rows = await gamificationModels.ranks.findAll({
    where: {
      archived: false,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    } as never,
  });

  const out: OtherRank[] = [];
  for (const r of rows) {
    const levels = readLevels(r.data).filter(
      (l) => Number.isFinite(l.level) && Number.isFinite(l.xp_start)
    );
    if (!levels.length) {
      out.push({ name: r.name, levels, minXp: 0, maxXp: 0, maxLevel: 0 });
      continue;
    }
    out.push({
      name: r.name,
      levels,
      minXp: Math.min(...levels.map((l) => l.xp_start)),
      maxXp: Math.max(...levels.map((l) => l.xp_end)),
      maxLevel: Math.max(...levels.map((l) => l.level)),
    });
  }
  return out;
};

export const assertValidRankPayload = async (
  payload: RankPayload,
  excludeId?: string
): Promise<void> => {
  const name = (payload.name ?? "").trim();
  const others = await loadOtherRanks(excludeId);

  // 1. Unique rank name (case-insensitive).
  const dupe = others.find(
    (o) => o.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (dupe) {
    throw new AppError(`A rank named "${dupe.name}" already exists`, 409);
  }

  const levels = readLevels(payload.data);

  // Drafts without levels are allowed (the ladder simply ignores them).
  if (levels.length === 0) return;

  // 2. Internal consistency of the payload's own levels.
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  sorted.forEach((l, i) => {
    if (!Number.isInteger(l.level) || l.level < 1) {
      throw new AppError(`Level numbers must be positive integers`, 422);
    }
    if (!Number.isFinite(l.xp_start) || !Number.isFinite(l.xp_end)) {
      throw new AppError(`Level ${l.level} has an invalid XP window`, 422);
    }
    if (l.xp_end <= l.xp_start) {
      throw new AppError(
        `Level ${l.level} XP End (${l.xp_end}) must be greater than XP Start (${l.xp_start})`,
        422
      );
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (l.level !== prev.level + 1) {
        throw new AppError(
          `Levels must be consecutive — expected level ${
            prev.level + 1
          } after level ${prev.level}, got ${l.level}`,
          422
        );
      }
      if (l.xp_start !== prev.xp_end) {
        throw new AppError(
          `Level ${l.level} must start at ${prev.xp_end} XP (where level ${prev.level} ends) — XP windows must be continuous`,
          422
        );
      }
    }
  });

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // 3. Find the predecessor rank this payload must continue from.
  //    create  → the current top of the ladder (highest XP).
  //    update  → the rank whose XP ends right where this rank currently
  //              starts, so an in-place edit keeps its position.
  const ranked = others.filter((o) => o.levels.length > 0);

  let currentStartXp = first.xp_start;
  if (excludeId) {
    const self = await gamificationModels.ranks.findByPk(excludeId);
    const selfLevels = self ? readLevels(self.data) : [];
    if (selfLevels.length) {
      currentStartXp = Math.min(...selfLevels.map((l) => l.xp_start));
    }
  }

  const predecessor = excludeId
    ? ranked
        .filter((o) => o.maxXp <= currentStartXp)
        .sort((a, b) => b.maxXp - a.maxXp)[0] ?? null
    : ranked.sort((a, b) => b.maxXp - a.maxXp)[0] ?? null;

  const expectedStartLevel = predecessor ? predecessor.maxLevel + 1 : 1;
  const expectedStartXp = predecessor ? predecessor.maxXp : 0;

  if (first.level !== expectedStartLevel) {
    throw new AppError(
      predecessor
        ? `Levels must continue from level ${expectedStartLevel} (rank "${predecessor.name}" ends at level ${predecessor.maxLevel}), but this rank starts at level ${first.level}`
        : `The first rank must start at level 1, but this rank starts at level ${first.level}`,
      422
    );
  }
  if (first.xp_start !== expectedStartXp) {
    throw new AppError(
      predecessor
        ? `XP must continue from ${expectedStartXp} XP (rank "${predecessor.name}" ends there), but this rank starts at ${first.xp_start} XP`
        : `The first rank must start at 0 XP, but this rank starts at ${first.xp_start} XP`,
      422
    );
  }

  // 4. No level number or XP window may collide with another rank.
  for (const other of ranked) {
    if (predecessor && other.name === predecessor.name) {
      // contiguous touch at the shared boundary is expected, not an overlap
      const onlyBoundary =
        first.xp_start === other.maxXp && last.xp_end > other.maxXp;
      if (onlyBoundary && other.maxLevel < first.level) continue;
    }

    const levelClash = other.levels.find(
      (l) => l.level >= first.level && l.level <= last.level
    );
    if (levelClash) {
      throw new AppError(
        `Level ${levelClash.level} already exists in rank "${other.name}"`,
        422
      );
    }

    const xpOverlap =
      first.xp_start < other.maxXp && last.xp_end > other.minXp;
    if (xpOverlap) {
      throw new AppError(
        `XP range ${first.xp_start}–${last.xp_end} overlaps rank "${other.name}" (${other.minXp}–${other.maxXp} XP)`,
        422
      );
    }
  }
};
