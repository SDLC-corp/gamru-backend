import {
  playerRepository,
  playerRewardRepository,
  playerLogRepository,
} from "../../player/model/player.repository";
import Player from "../../player/model/player.model";
import ExternalAccount from "../model/external-account.model";
import GamXpTransaction from "../model/gam-xp-transaction.model";
import {
  loadLadder,
  resolveProgress,
  newlyRewardedRungs,
} from "./gam.engine";
import { recomputeDynamicSegmentCounts } from "../../segment/service/segment.service";
import type { ResolvedClient } from "../../../types/request.type";

export type SyncEventType =
  | "USER_REGISTERED"
  | "XP_AWARDED"
  | "LEVEL_UP"
  | "RANK_UP"
  | "DEPOSIT_MADE";

export interface SyncEvent {
  /** Stable, globally-unique id used for idempotency. */
  event_id: string;
  event_type: SyncEventType;
  /** The gamify-engage user id. */
  external_id: string;
  origin?: string;
  email?: string | null;
  /** XP delta for XP_AWARDED. */
  amount?: number;
  meta?: Record<string, unknown>;
}

export interface ApplyResult {
  applied: boolean;
  duplicate?: boolean;
  reason?: string;
  player?: {
    id: string;
    xp_points: number;
    level: number;
    rank_name: string | null;
    xp_to_next: number;
  };
}

/**
 * Resolve (and lazily link) the gamru Player behind a gamify user.
 * Linking happens by email — the gamify USER_REGISTERED push carries the
 * email and arrives right after the mirror user/player is created here.
 */
const resolvePlayer = async (
  origin: string,
  externalId: string,
  email?: string | null
): Promise<{ account: ExternalAccount; player: Player | null }> => {
  let account = await ExternalAccount.findOne({
    where: { origin, external_id: externalId },
  });

  let player: Player | null = null;
  if (account?.player_id) {
    player = await playerRepository.findByPk(account.player_id);
  }

  if (!player && email) {
    player = await playerRepository.findOne({ email });
  }

  if (!account) {
    account = await ExternalAccount.create({
      origin,
      external_id: externalId,
      email: email ?? null,
      player_id: player?.id ?? null,
    });
  } else if (player && account.player_id !== player.id) {
    await account.update({ player_id: player.id, email: email ?? account.email });
  }

  return { account, player };
};

/** Auto-grant the per-level rewards crossed by this XP gain. */
const grantLevelRewards = async (
  player: Player,
  prevXp: number,
  nextXp: number,
  ladder: Awaited<ReturnType<typeof loadLadder>>
): Promise<number> => {
  const rungs = newlyRewardedRungs(prevXp, nextXp, ladder);
  let granted = 0;
  for (const rung of rungs) {
    const label = `Level ${rung.level} – ${rung.reward_type} ${rung.reward_value}`;
    const exists = await playerRewardRepository.findOne({
      player_id: player.id,
      gamification_source: "ranks",
      reward: label,
    });
    if (exists) continue;
    await playerRewardRepository.create({
      player_id: player.id,
      status: "IN_PROGRESS",
      granted_date: new Date(),
      gamification_source: "ranks",
      reward_type: rung.reward_type ?? null,
      reward: label,
      is_manual: false,
    });
    await playerLogRepository.create({
      player_id: player.id,
      action: "Level Reward Granted",
      detail: `${rung.rank_name} • ${label}`,
      actor: "gamify-sync",
    });
    granted += 1;
  }
  return granted;
};

/**
 * Single source of truth for "give a player XP". Accumulates the delta,
 * recomputes level/rank/xp_to_next from the CRM rank ladder and auto-grants
 * any per-level rewards crossed. Returns the updated player plus the
 * resolved progression. Does NOT log or write the XP ledger — callers
 * (sync vs. admin endpoint) own their own audit trail.
 */
export const applyXpToPlayer = async (
  player: Player,
  delta: number
): Promise<{
  player: Player;
  prevXp: number;
  nextXp: number;
  progress: ReturnType<typeof resolveProgress>;
}> => {
  const prevXp = Number(player.xp_points ?? 0);
  const nextXp = prevXp + (Number(delta) || 0);

  const ladder = await loadLadder();
  const progress = resolveProgress(nextXp, ladder);

  const patch: Partial<Player["_creationAttributes"]> = { xp_points: nextXp };
  if (progress) {
    patch.level = progress.level;
    patch.rank_name = progress.rank_name;
    patch.xp_to_next = progress.xp_to_next;
    patch.max_level = progress.max_level;
  }
  const updated = (await playerRepository.updateByPk(
    player.id,
    patch
  )) as Player;

  if (progress) {
    await grantLevelRewards(updated, prevXp, nextXp, ladder);
  }

  return { player: updated, prevXp, nextXp, progress };
};

/**
 * Apply a deposit to a player's CRM record. The wallet balance itself lives
 * in the game platform's own DB (the source of truth); here we only record
 * the deposit summary for analytics and — crucially — move the player out of
 * the "no_deposit" audience into "depositor" so the No-deposit segment empties
 * and the Deposited segment fills on the player's first deposit.
 */
const applyDeposit = async (
  player: Player,
  amount: number
): Promise<Player> => {
  // Tags: depositor and no_deposit are mutually exclusive. Keep every other
  // tag (e.g. new_player, vip) untouched.
  const tags = new Set<string>(
    Array.isArray(player.tags) ? (player.tags as string[]) : []
  );
  tags.add("depositor");
  tags.delete("no_deposit");

  // Deposit summary, stored alongside the player's other transactional data.
  const td =
    (player.transactional_data as Record<string, unknown> | null) ?? {};
  const depositCount = Number((td["Deposit Count"] as number | undefined) ?? 0) + 1;
  const totalDeposit =
    Number((td["Total Deposit"] as number | undefined) ?? 0) + amount;
  const now = new Date().toISOString();

  const updated = (await playerRepository.updateByPk(player.id, {
    tags: Array.from(tags),
    transactional_data: {
      ...td,
      "Deposit Count": depositCount,
      "Total Deposit": totalDeposit,
      "Last Deposit Amount": amount,
      "Last Deposit Date": now,
      ...(depositCount === 1 ? { "First Deposit Date": now } : {}),
    },
  } as Partial<Player["_creationAttributes"]>)) as Player;

  return updated;
};

const summarize = (p: Player): ApplyResult["player"] => ({
  id: p.id,
  xp_points: Number(p.xp_points ?? 0),
  level: Number(p.level ?? 1),
  rank_name: p.rank_name ?? null,
  xp_to_next: Number(p.xp_to_next ?? 0),
});

/**
 * Apply one inbound sync event. Idempotent on `event_id` via the
 * gam_xp_transactions UNIQUE ledger. Gamru owns progression: XP is
 * accumulated locally and the level/rank is recomputed from the CRM
 * rank ladder, so LEVEL_UP / RANK_UP pushes are audit-only.
 */
export const applyEvent = async (
  event: SyncEvent,
  client?: ResolvedClient
): Promise<ApplyResult> => {
  // The calling client's slug becomes the event's origin, so per-client
  // ExternalAccount mappings stay isolated (e.g. `sdlc-corps` vs.
  // `acme-casino` can both have the same `external_id` without colliding).
  const origin = event.origin || client?.slug || "gamify";

  // Provenance stamped onto every ledger row + log so a future operator
  // can answer "which client pushed this XP?" without grepping nginx logs.
  const metaWithClient: Record<string, unknown> | null = client
    ? { ...(event.meta ?? {}), client_id: client.id, client_slug: client.slug }
    : (event.meta ?? null);
  const actor = client ? `client:${client.slug}` : "gamify-sync";

  const seen = await GamXpTransaction.findOne({
    where: { event_id: event.event_id },
  });
  if (seen) return { applied: false, duplicate: true };

  const { player } = await resolvePlayer(
    origin,
    event.external_id,
    event.email
  );

  // USER_REGISTERED only establishes the link; nothing else to do.
  if (event.event_type === "USER_REGISTERED") {
    await GamXpTransaction.create({
      player_id: player?.id ?? null,
      event_id: event.event_id,
      event_type: event.event_type,
      external_id: event.external_id,
      amount: 0,
      balance_after: player ? Number(player.xp_points ?? 0) : 0,
      meta: metaWithClient,
    });
    return {
      applied: true,
      player: player ? summarize(player) : undefined,
    };
  }

  if (!player) {
    // No mirror player yet — DON'T record the event so a later retry,
    // once the link exists, can still apply this XP.
    return { applied: false, reason: "player_not_found" };
  }

  // LEVEL_UP / RANK_UP are recomputed from XP here — record for audit only.
  if (event.event_type === "LEVEL_UP" || event.event_type === "RANK_UP") {
    await GamXpTransaction.create({
      player_id: player.id,
      event_id: event.event_id,
      event_type: event.event_type,
      external_id: event.external_id,
      amount: 0,
      balance_after: Number(player.xp_points ?? 0),
      meta: metaWithClient,
    });
    return { applied: true, player: summarize(player) };
  }

  // ── DEPOSIT_MADE ─────────────────────────────────────────────────
  // Move the player from the "no_deposit" segment into "depositor" and
  // record the deposit. The wallet balance is owned by the game platform.
  if (event.event_type === "DEPOSIT_MADE") {
    const amount = Number(event.amount) || 0;
    const updated = await applyDeposit(player, amount);

    await playerLogRepository.create({
      player_id: player.id,
      action: "Deposit",
      detail: `Deposit of ${amount} from ${client?.name ?? origin}`,
      actor,
    });

    await GamXpTransaction.create({
      player_id: player.id,
      event_id: event.event_id,
      event_type: event.event_type,
      external_id: event.external_id,
      amount,
      balance_after: Number(updated.xp_points ?? 0),
      meta: metaWithClient,
    });

    // The player's tags changed, so segment audiences are now stale.
    void recomputeDynamicSegmentCounts().catch((err) =>
      console.error("Segment recount after deposit failed:", err)
    );

    return { applied: true, player: summarize(updated) };
  }

  // ── XP_AWARDED ───────────────────────────────────────────────────
  const delta = Number(event.amount) || 0;
  const { player: updated, nextXp, progress } = await applyXpToPlayer(
    player,
    delta
  );

  await playerLogRepository.create({
    player_id: player.id,
    action: "XP Synced",
    detail: `+${delta} XP from ${client?.name ?? origin} (total ${nextXp})${
      progress ? ` • Lvl ${progress.level} ${progress.rank_name}` : ""
    }`,
    actor,
  });

  await GamXpTransaction.create({
    player_id: player.id,
    event_id: event.event_id,
    event_type: event.event_type,
    external_id: event.external_id,
    amount: delta,
    balance_after: nextXp,
    meta: metaWithClient,
  });

  return { applied: true, player: summarize(updated) };
};
