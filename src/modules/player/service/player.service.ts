import {
  playerRepository,
  playerCampaignHistoryRepository,
  playerRewardRepository,
  playerLogRepository,
  PlayerFilter,
} from "../model/player.repository";
import { Player } from "../model/player.model";
import playerDataRepository from "../../player-data/model/player-data.repository";
import { PlayerDataType } from "../../player-data/model/player-data.model";
import { AppError } from "../../../utils/AppError";
import {
  loadLadder,
  firstRung,
  resolveProgress,
  resolveNextRank,
} from "../../integration/service/gam.engine";
import { applyXpToPlayer } from "../../integration/service/integration.service";
import { gamificationModels } from "../../gamification/shared/gamification.model";

type Json = Record<string, unknown>;

/** Default value shown for a custom field a player has no value for yet. */
const defaultForType = (t: PlayerDataType): unknown =>
  t === "BOOLEAN" ? false : null;

/** All CRM custom-data field definitions, in CRM display order. */
const fetchCustomDefs = () =>
  playerDataRepository.findWhere(
    { is_custom: true },
    { order: [["created_at", "ASC"]] }
  );

/**
 * Merge the CRM custom-data definitions into a player's stored
 * `custom_data` bucket. The CRM definitions decide which keys exist;
 * the player's own stored value wins, otherwise a typed default is
 * shown. Any previously-stored key whose definition was deleted in CRM
 * is preserved so no per-player data is silently lost.
 */
const applyCustomData = (
  stored: Json | null | undefined,
  defs: { name: string; data_type: PlayerDataType }[]
): Json => {
  const current: Json = stored ?? {};
  const synced: Json = {};
  for (const d of defs) {
    synced[d.name] =
      d.name in current ? current[d.name] : defaultForType(d.data_type);
  }
  return { ...current, ...synced };
};

export interface PlayerInput {
  player_id: string;
  username: string;
  name?: string | null;
  email?: string | null;
  status?: string;
  registration_date?: Date | string | null;
  country?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  mobile_number?: string | null;
  birthday?: Date | string | null;
  address?: string | null;
  language?: string | null;
  account_status?: string | null;
  gamification_active?: boolean;
  level?: number;
  max_level?: number;
  xp_points?: number;
  xp_to_next?: number;
  rank_name?: string | null;
  tokens?: number;
  consents?: Record<string, unknown> | null;
  personalization?: Record<string, unknown> | null;
  player_data?: Record<string, unknown> | null;
  custom_data?: Record<string, unknown> | null;
  transactional_data?: Record<string, unknown> | null;
}

export const paginatePlayersService = async (
  page: number,
  limit: number,
  filter: PlayerFilter
) => {
  const result = await playerRepository.paginatePlayers(page, limit, filter);
  const defs = await fetchCustomDefs();
  return {
    ...result,
    data: result.data.map((p) => ({
      ...p.toJSON(),
      custom_data: applyCustomData(p.custom_data as Json | null, defs),
    })),
  };
};

export const getPlayerService = async (id: string) => {
  const player = await playerRepository.findByPk(id);
  if (!player) throw new AppError("Player not found", 404);
  const [defs, ladder] = await Promise.all([fetchCustomDefs(), loadLadder()]);

  const xp = Number(player.xp_points ?? 0);
  const progress = resolveProgress(xp, ladder) ?? {
    level: Number(player.level ?? 1),
    rank_name: player.rank_name ?? null,
    xp_points: xp,
    xp_to_next: Number(player.xp_to_next ?? 0),
    max_level: Number(player.max_level ?? 0),
  };
  const next_rank = resolveNextRank(xp, ladder);

  return {
    ...player.toJSON(),
    custom_data: applyCustomData(player.custom_data as Json | null, defs),
    gamification: {
      progress,
      next_rank,
    },
  };
};

/** ACTIVE, non-archived rows of one gamification feature, priority first. */
const fetchFeature = (key: keyof typeof gamificationModels) =>
  gamificationModels[key].findAll({
    where: { status: "ACTIVE", archived: false } as never,
    order: [
      ["priority", "DESC"],
      ["created_at", "DESC"],
    ],
  });

/**
 * Full player snapshot for the gamify frontend: the player profile plus
 * everything that drives the gamification UI — the live rank ladder
 * (ranks + their levels), the player's resolved progression against it,
 * the catalog of missions / mission bundles / reward-shop items, and the
 * player's own earned rewards and recent activity logs.
 */
export const getPlayerByEmailService = async (email: string) => {
  const player = await playerRepository.findOne({ email });
  if (!player) {
    throw new AppError("Player not found", 404);
  }

  const defs = await fetchCustomDefs();

  const [ranks, missions, missionBundles, rewardShop, ladder] =
    await Promise.all([
      fetchFeature("ranks"),
      fetchFeature("missions"),
      fetchFeature("mission-bundles"),
      fetchFeature("reward-shop"),
      loadLadder(),
    ]);

  const [rewards, logs] = await Promise.all([
    playerRewardRepository.findWhere(
      { player_id: player.id },
      { order: [["created_at", "DESC"]] }
    ),
    playerLogRepository.findWhere(
      { player_id: player.id },
      { order: [["created_at", "DESC"]], limit: 50 }
    ),
  ]);

  const xpTotal = Number(player.xp_points ?? 0);
  const progress =
    resolveProgress(xpTotal, ladder) ?? {
      level: Number(player.level ?? 1),
      rank_name: player.rank_name ?? null,
      xp_points: xpTotal,
      xp_to_next: Number(player.xp_to_next ?? 0),
      max_level: Number(player.max_level ?? 0),
    };
  const next_rank = resolveNextRank(xpTotal, ladder);

  return {
    ...player.toJSON(),
    custom_data: applyCustomData(player.custom_data as Json | null, defs),
    gamification: {
      progress,
      next_rank,
      levels: ladder,
      ranks,
      missions,
      mission_bundles: missionBundles,
      reward_shop: rewardShop,
      rewards,
      logs,
    },
  };
};

/**
 * Admin/integration helper: give a player (resolved by email) an XP delta.
 * Reuses the single gamification engine so level, rank, xp_to_next and any
 * crossed per-level rewards update exactly like the gamify sync path.
 */
export const addPlayerXpByEmailService = async (
  email: string,
  amount: number,
  actor?: string | null
) => {
  const player = await playerRepository.findOne({ email });
  if (!player) {
    throw new AppError("Player not found", 404);
  }

  const delta = Number(amount);
  if (!Number.isFinite(delta) || delta === 0) {
    throw new AppError("amount must be a non-zero number", 400);
  }

  const { player: updated, nextXp, progress } = await applyXpToPlayer(
    player,
    delta
  );

  await playerLogRepository.create({
    player_id: player.id,
    action: "XP Adjusted",
    detail: `${delta > 0 ? "+" : ""}${delta} XP (total ${nextXp})${
      progress ? ` • Lvl ${progress.level} ${progress.rank_name}` : ""
    }`,
    actor: actor ?? "admin",
  });

  return {
    id: updated.id,
    player_id: updated.player_id,
    email: updated.email,
    xp_points: Number(updated.xp_points ?? 0),
    level: Number(updated.level ?? 1),
    rank_name: updated.rank_name ?? null,
    xp_to_next: Number(updated.xp_to_next ?? 0),
    max_level: Number(updated.max_level ?? 0),
    leveled_up: progress
      ? Number(player.level ?? 1) !== progress.level
      : false,
    rank_changed: progress
      ? (player.rank_name ?? null) !== progress.rank_name
      : false,
  };
};

/**
 * Keep the `player_data` JSON bucket in sync with the player's core
 * columns so the "Player Data" tab always shows a populated record.
 * Derived keys are recomputed from the latest core values; any extra
 * keys the caller supplied in player_data are preserved.
 */
const buildPlayerData = (p: Partial<PlayerInput>, existing?: Json): Json => {
  const derived: Json = {
    "Player ID": p.player_id ?? existing?.["Player ID"] ?? null,
    Username: p.username ?? existing?.["Username"] ?? null,
    "First Name": p.name ?? existing?.["First Name"] ?? null,
    Email: p.email ?? existing?.["Email"] ?? null,
    Country: p.country ?? existing?.["Country"] ?? null,
    City: p.city ?? existing?.["City"] ?? null,
    Language: p.language ?? existing?.["Language"] ?? null,
    Phone: p.mobile_number ?? existing?.["Phone"] ?? null,
    "Birth Date": p.birthday ?? existing?.["Birth Date"] ?? null,
    "Registration Date":
      p.registration_date ?? existing?.["Registration Date"] ?? null,
    "Gamification Opt-In":
      p.gamification_active ?? existing?.["Gamification Opt-In"] ?? true,
  };
  // caller-supplied attributes first, then refreshed derived keys win.
  return { ...(existing ?? {}), ...(p.player_data ?? {}), ...derived };
};

const withBuckets = (
  input: Partial<PlayerInput>,
  current?: Player
): Partial<PlayerInput> => {
  const existing = (current?.player_data as Json | undefined) ?? undefined;
  return {
    ...input,
    consents:
      input.consents ??
      current?.consents ?? {
        email: true,
        sms: true,
        onsite: true,
        push: true,
        phone: true,
        post: true,
      },
    personalization:
      input.personalization ??
      current?.personalization ?? { casino: {}, sports: {} },
    transactional_data:
      input.transactional_data ??
      current?.transactional_data ?? {
        "Player ID": input.player_id ?? current?.player_id ?? null,
      },
    custom_data: input.custom_data ?? current?.custom_data ?? {},
    player_data: buildPlayerData(input, existing),
  };
};

/**
 * Allocate a brand-new player onto the configured rank ladder: the first
 * rank and its entry-level XP. Falls back to the model defaults when no
 * ranks are configured or the caller already supplied progression values.
 */
const applyInitialGamification = async (
  input: PlayerInput
): Promise<PlayerInput> => {
  if (
    input.level !== undefined ||
    input.rank_name !== undefined ||
    input.xp_points !== undefined
  ) {
    return input;
  }
  try {
    const ladder = await loadLadder();
    const start = firstRung(ladder);
    if (!start) return input;
    const xp = start.xp_start;
    const progress = resolveProgress(xp, ladder);
    if (!progress) return input;
    return {
      ...input,
      xp_points: progress.xp_points,
      level: progress.level,
      rank_name: progress.rank_name,
      xp_to_next: progress.xp_to_next,
      max_level: progress.max_level,
    };
  } catch (err) {
    console.error("Failed to allocate initial rank for player:", err);
    return input;
  }
};

export const createPlayerService = async (input: PlayerInput) => {
  const existing = await playerRepository.findOne({
    player_id: input.player_id,
  });
  if (existing) throw new AppError("player_id already exists", 409);
  const seeded = await applyInitialGamification(input);
  return playerRepository.create(
    withBuckets(seeded) as Partial<Player["_creationAttributes"]>
  );
};

export const updatePlayerService = async (
  id: string,
  data: Partial<PlayerInput>
) => {
  const current = await playerRepository.findByPk(id);
  if (!current) throw new AppError("Player not found", 404);
  const updated = await playerRepository.updateByPk(
    id,
    withBuckets(data, current) as Partial<Player["_creationAttributes"]>
  );
  if (!updated) throw new AppError("Player not found", 404);
  return updated;
};

export const deletePlayerService = async (id: string) => {
  const deleted = await playerRepository.deleteByPk(id);
  if (!deleted) throw new AppError("Player not found", 404);
  return null;
};

const ensurePlayer = async (id: string) => {
  const player = await playerRepository.findByPk(id);
  if (!player) throw new AppError("Player not found", 404);
  return player;
};

export const getCampaignHistoryService = async (
  id: string,
  page: number,
  limit: number,
  search?: string
) => {
  await ensurePlayer(id);
  return playerCampaignHistoryRepository.paginateForPlayer(
    id,
    page,
    limit,
    search
  );
};

export const getRewardsService = async (
  id: string,
  page: number,
  limit: number
) => {
  await ensurePlayer(id);
  return playerRewardRepository.paginateForPlayer(id, page, limit);
};

export const addManualRewardService = async (
  id: string,
  data: { reward_type: string; reward?: string | null; actor?: string | null }
) => {
  await ensurePlayer(id);
  const reward = await playerRewardRepository.create({
    player_id: id,
    status: "IN_PROGRESS",
    granted_date: new Date(),
    gamification_source: "Manual",
    reward_type: data.reward_type,
    reward: data.reward ?? null,
    is_manual: true,
  });
  await playerLogRepository.create({
    player_id: id,
    action: "Manual Reward Added",
    detail: `${data.reward_type}${data.reward ? ` — ${data.reward}` : ""}`,
    actor: data.actor ?? null,
  });
  return reward;
};

export const getLogsService = async (
  id: string,
  page: number,
  limit: number
) => {
  await ensurePlayer(id);
  return playerLogRepository.paginateForPlayer(id, page, limit);
};
