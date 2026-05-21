import {
  playerRepository,
  playerRewardRepository,
  playerLogRepository,
} from "../../player/model/player.repository";
import Player from "../../player/model/player.model";
import ExternalAccount from "../model/external-account.model";
import GamXpTransaction from "../model/gam-xp-transaction.model";
import Client from "../../client/model/client.model";
import {
  loadLadder,
  resolveProgress,
  newlyRewardedRungs,
} from "./gam.engine";

export type SyncEventType =
  | "USER_REGISTERED"
  | "XP_AWARDED"
  | "LEVEL_UP"
  | "RANK_UP";

export interface SyncEvent {
  /** Stable, globally-unique id used for idempotency. */
  event_id: string;
  event_type: SyncEventType;
  /** The consuming platform's user id. */
  external_id: string;
  /**
   * Origin slug. When the client is authenticated via `clientAuth`, the
   * slug is taken from the Client and this field is ignored. Kept on the
   * payload for backward compatibility with legacy `x-service-key` calls.
   */
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
 * Resolve (and lazily link) the Gamru Player behind a consumer's user.
 * Linking happens by email — the USER_REGISTERED push carries the email
 * and arrives right after the mirror user/player is created here.
 *
 * When `client` is supplied (the new clientAuth flow), every row written
 * is stamped with `client_id` so the admin UI can show "which Players
 * came from which platform" without joining on a freeform `origin` string.
 */
const resolvePlayer = async (
  origin: string,
  externalId: string,
  email?: string | null,
  client?: Client | null
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
      client_id: client?.id ?? null,
    });
  } else {
    const patch: Partial<ExternalAccount["_creationAttributes"]> = {};
    if (player && account.player_id !== player.id) patch.player_id = player.id;
    if (email && account.email !== email) patch.email = email;
    if (client && account.client_id !== client.id) patch.client_id = client.id;
    if (Object.keys(patch).length > 0) await account.update(patch);
  }

  // Stamp client ownership on the Player too (first writer wins; never
  // overwrites an existing attribution so two clients can't fight over
  // the same player).
  if (client && player && !player.client_id) {
    await player.update({ client_id: client.id });
  }

  return { account, player };
};

/** Auto-grant the per-level rewards crossed by this XP gain. */
const grantLevelRewards = async (
  player: Player,
  prevXp: number,
  nextXp: number,
  ladder: Awaited<ReturnType<typeof loadLadder>>,
  client?: Client | null
): Promise<number> => {
  const rungs = newlyRewardedRungs(prevXp, nextXp, ladder);
  let granted = 0;
  const actor = client ? `${client.slug}-sync` : "gamify-sync";
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
      actor,
      client_id: client?.id ?? null,
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
  delta: number,
  client?: Client | null
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
  // First writer wins for client attribution on the Player.
  if (client && !player.client_id) patch.client_id = client.id;

  const updated = (await playerRepository.updateByPk(
    player.id,
    patch
  )) as Player;

  if (progress) {
    await grantLevelRewards(updated, prevXp, nextXp, ladder, client);
  }

  return { player: updated, prevXp, nextXp, progress };
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
 *
 * When `client` is supplied (the authenticated tenant under the new
 * clientAuth flow) every written row is attributed to it so the admin
 * UI can show per-client traffic. If null (legacy serviceAuth fallback),
 * the system reverts to the historical `origin` string for routing.
 */
export const applyEvent = async (
  event: SyncEvent,
  client?: Client | null
): Promise<ApplyResult> => {
  // The Client (when authenticated) is authoritative for the origin slug.
  // We still accept event.origin / "gamify" as a fallback for legacy pushes.
  const origin = client?.slug ?? event.origin ?? "gamify";
  const actor = client ? `${client.slug}-sync` : "gamify-sync";

  const seen = await GamXpTransaction.findOne({
    where: { event_id: event.event_id },
  });
  if (seen) return { applied: false, duplicate: true };

  const { player } = await resolvePlayer(
    origin,
    event.external_id,
    event.email,
    client
  );

  // USER_REGISTERED only establishes the link; nothing else to do.
  if (event.event_type === "USER_REGISTERED") {
    await GamXpTransaction.create({
      player_id: player?.id ?? null,
      client_id: client?.id ?? null,
      event_id: event.event_id,
      event_type: event.event_type,
      external_id: event.external_id,
      amount: 0,
      balance_after: player ? Number(player.xp_points ?? 0) : 0,
      meta: event.meta ?? null,
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
      client_id: client?.id ?? null,
      event_id: event.event_id,
      event_type: event.event_type,
      external_id: event.external_id,
      amount: 0,
      balance_after: Number(player.xp_points ?? 0),
      meta: event.meta ?? null,
    });
    return { applied: true, player: summarize(player) };
  }

  // ── XP_AWARDED ───────────────────────────────────────────────────
  const delta = Number(event.amount) || 0;
  const { player: updated, nextXp, progress } = await applyXpToPlayer(
    player,
    delta,
    client
  );

  await playerLogRepository.create({
    player_id: player.id,
    client_id: client?.id ?? null,
    action: "XP Synced",
    detail: `+${delta} XP from ${origin} (total ${nextXp})${
      progress ? ` • Lvl ${progress.level} ${progress.rank_name}` : ""
    }`,
    actor,
  });

  await GamXpTransaction.create({
    player_id: player.id,
    client_id: client?.id ?? null,
    event_id: event.event_id,
    event_type: event.event_type,
    external_id: event.external_id,
    amount: delta,
    balance_after: nextXp,
    meta: event.meta ?? null,
  });

  return { applied: true, player: summarize(updated) };
};
