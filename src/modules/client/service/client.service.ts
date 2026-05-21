import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import clientRepository from "../model/client.repository";
import Client, {
  ALL_CLIENT_SCOPES,
  ClientScope,
  ClientStatus,
} from "../model/client.model";
import ExternalAccount from "../../integration/model/external-account.model";
import GamXpTransaction from "../../integration/model/gam-xp-transaction.model";
import Player from "../../player/model/player.model";
import { AppError } from "../../../utils/AppError";

const SECRET_ROUNDS = 10;
const CLIENT_ID_PREFIX =
  process.env.NODE_ENV === "production" ? "cl_live_" : "cl_test_";

/** URL-safe random bytes encoded as base64url. */
const randomToken = (bytes: number): string =>
  crypto.randomBytes(bytes).toString("base64url");

const validateScopes = (scopes: string[] | undefined): ClientScope[] => {
  if (!scopes || scopes.length === 0) return [];
  const invalid = scopes.filter(
    (s) => !(ALL_CLIENT_SCOPES as readonly string[]).includes(s)
  );
  if (invalid.length > 0) {
    throw new AppError(
      `Unknown scope(s): ${invalid.join(", ")}. ` +
        `Allowed: ${ALL_CLIENT_SCOPES.join(", ")}`,
      400
    );
  }
  return scopes as ClientScope[];
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export interface CreateClientInput {
  name: string;
  slug?: string;
  description?: string | null;
  contact_email?: string | null;
  service_scopes?: string[];
  ip_allowlist?: string[] | null;
  rate_limit_per_minute?: number;
  webhook_url?: string | null;
}

export interface UpdateClientInput {
  name?: string;
  description?: string | null;
  contact_email?: string | null;
  service_scopes?: string[];
  ip_allowlist?: string[] | null;
  rate_limit_per_minute?: number;
  webhook_url?: string | null;
  status?: ClientStatus;
}

export interface CreatedClientReveal {
  client: Client;
  /** Plaintext secret — returned ONCE at issuance, never stored or shown again. */
  client_secret: string;
}

/**
 * Create a new tenant. Returns the model + the plaintext secret. The
 * plaintext secret must be surfaced to the operator immediately (and only
 * once) so they can hand it to the integrating platform.
 */
export const createClientService = async (
  input: CreateClientInput,
  createdBy: string | null
): Promise<CreatedClientReveal> => {
  const slug = slugify(input.slug ?? input.name);
  if (!slug) throw new AppError("Slug could not be derived from name", 400);

  if (await clientRepository.findBySlug(slug)) {
    throw new AppError(`Client slug "${slug}" is already taken`, 409);
  }

  const scopes = validateScopes(input.service_scopes);
  const plaintextSecret = randomToken(36);
  const client_id = `${CLIENT_ID_PREFIX}${slug.replace(/-/g, "_")}_${randomToken(
    6
  )}`;

  const client = await clientRepository.create({
    name: input.name,
    slug,
    description: input.description ?? null,
    status: "ACTIVE",
    client_id,
    client_secret_hash: await bcrypt.hash(plaintextSecret, SECRET_ROUNDS),
    service_scopes: scopes,
    ip_allowlist: input.ip_allowlist ?? null,
    rate_limit_per_minute: input.rate_limit_per_minute ?? 600,
    webhook_url: input.webhook_url ?? null,
    webhook_secret_hash: null,
    contact_email: input.contact_email ?? null,
    last_seen_at: null,
    last_seen_ip: null,
    created_by: createdBy,
  });

  return { client, client_secret: plaintextSecret };
};

/**
 * Paginated listing with usage counters joined per-row. Lightweight
 * enough for the Clients overview table.
 */
export const paginateClientsService = async (
  page = 1,
  limit = 25,
  filters: { search?: string; status?: ClientStatus } = {}
) => {
  const where: Record<string, unknown> = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    const q = `%${filters.search}%`;
    Object.assign(where, {
      [Op.or]: [
        { name: { [Op.iLike]: q } },
        { slug: { [Op.iLike]: q } },
        { client_id: { [Op.iLike]: q } },
      ],
    });
  }

  const result = await clientRepository.paginate(page, limit, where);

  const ids = result.data.map((c) => c.id);
  const [playerCounts, eventCounts] = await Promise.all([
    countByClient(ExternalAccount, ids),
    countByClient(GamXpTransaction, ids),
  ]);

  const data = result.data.map((c) => {
    const json = c.toJSON();
    return {
      ...json,
      usage: {
        linked_accounts: playerCounts[c.id] ?? 0,
        total_events: eventCounts[c.id] ?? 0,
      },
    };
  });

  return { ...result, data };
};

export const getClientService = async (id: string) => {
  const row = await clientRepository.findByPk(id);
  if (!row) throw new AppError("Client not found", 404);
  return row;
};

export const updateClientService = async (
  id: string,
  input: UpdateClientInput
) => {
  const existing = await clientRepository.findByPk(id);
  if (!existing) throw new AppError("Client not found", 404);

  const patch: Partial<Client["_creationAttributes"]> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.contact_email !== undefined)
    patch.contact_email = input.contact_email;
  if (input.service_scopes !== undefined)
    patch.service_scopes = validateScopes(input.service_scopes);
  if (input.ip_allowlist !== undefined)
    patch.ip_allowlist = input.ip_allowlist;
  if (input.rate_limit_per_minute !== undefined)
    patch.rate_limit_per_minute = input.rate_limit_per_minute;
  if (input.webhook_url !== undefined) patch.webhook_url = input.webhook_url;
  if (input.status !== undefined) patch.status = input.status;

  const updated = await clientRepository.updateByPk(id, patch);
  if (!updated) throw new AppError("Client not found", 404);
  return updated;
};

export const setClientStatusService = async (
  id: string,
  status: ClientStatus
) => updateClientService(id, { status });

export const deleteClientService = async (id: string) => {
  const ok = await clientRepository.deleteByPk(id);
  if (!ok) throw new AppError("Client not found", 404);
  return null;
};

/**
 * Rotate the client's secret. Returns the new plaintext secret (shown
 * once). The old secret is invalidated immediately — coordinate the
 * cutover with the integrating platform.
 */
export const rotateClientSecretService = async (
  id: string
): Promise<{ client: Client; client_secret: string }> => {
  const existing = await clientRepository.findByPk(id);
  if (!existing) throw new AppError("Client not found", 404);

  const plaintextSecret = randomToken(36);
  const updated = await clientRepository.updateByPk(id, {
    client_secret_hash: await bcrypt.hash(plaintextSecret, SECRET_ROUNDS),
  });
  if (!updated) throw new AppError("Client not found", 404);
  return { client: updated, client_secret: plaintextSecret };
};

/**
 * Per-client snapshot of usage for the detail page — totals + 30-day
 * counters + a sparkline-friendly daily event series.
 */
export const getClientUsageService = async (id: string) => {
  const client = await clientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    linkedAccounts,
    totalEvents,
    events30d,
    eventsByDay,
    linkedPlayers,
  ] = await Promise.all([
    ExternalAccount.count({ where: { client_id: id } }),
    GamXpTransaction.count({ where: { client_id: id } }),
    GamXpTransaction.count({
      where: { client_id: id, created_at: { [Op.gte]: since30 } },
    }),
    GamXpTransaction.findAll({
      attributes: [
        [
          GamXpTransaction.sequelize!.fn(
            "DATE",
            GamXpTransaction.sequelize!.col("created_at")
          ),
          "day",
        ],
        [
          GamXpTransaction.sequelize!.fn(
            "COUNT",
            GamXpTransaction.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      where: { client_id: id, created_at: { [Op.gte]: since30 } },
      group: ["day"],
      order: [[GamXpTransaction.sequelize!.literal("day"), "ASC"]],
      raw: true,
    }) as unknown as Array<{ day: string; count: string }>,
    Player.count({ where: { client_id: id } }),
  ]);

  return {
    client_id: client.id,
    slug: client.slug,
    name: client.name,
    last_seen_at: client.last_seen_at,
    last_seen_ip: client.last_seen_ip,
    totals: {
      linked_accounts: linkedAccounts,
      linked_players: linkedPlayers,
      total_events: totalEvents,
      events_last_30d: events30d,
    },
    daily_events: eventsByDay.map((r) => ({
      day: r.day,
      count: Number(r.count),
    })),
  };
};

/** Recent inbound XP events for the Events tab of the detail page. */
export const listClientEventsService = async (
  id: string,
  page = 1,
  limit = 50
) => {
  const client = await clientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const offset = (page - 1) * limit;
  const { rows, count } = await GamXpTransaction.findAndCountAll({
    where: { client_id: id },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/** Players introduced to Gamru via this client. */
export const listClientPlayersService = async (
  id: string,
  page = 1,
  limit = 25
) => {
  const client = await clientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const offset = (page - 1) * limit;
  const { rows, count } = await Player.findAndCountAll({
    where: { client_id: id },
    attributes: [
      "id",
      "player_id",
      "username",
      "name",
      "email",
      "status",
      "level",
      "rank_name",
      "xp_points",
      "created_at",
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ─── Helpers ────────────────────────────────────────────────────────

const countByClient = async (
  // The union of ModelStatic types confuses TS's `this` inference on
  // findAll; widen to any for this internal helper — the call sites are
  // both well-typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  ids: string[]
): Promise<Record<string, number>> => {
  if (ids.length === 0) return {};
  const rows = (await model.findAll({
    attributes: [
      "client_id",
      [model.sequelize.fn("COUNT", model.sequelize.col("id")), "count"],
    ],
    where: { client_id: { [Op.in]: ids } },
    group: ["client_id"],
    raw: true,
  })) as Array<{ client_id: string; count: string }>;
  const out: Record<string, number> = {};
  for (const r of rows) out[r.client_id] = Number(r.count);
  return out;
};
