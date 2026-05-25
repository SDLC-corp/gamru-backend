import crypto from "crypto";
import ClientRepository from "../model/client.repository";
import Client, { ClientStatus } from "../model/client.model";
import { AppError } from "../../../utils/AppError";

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const generateAuthKey = (): string =>
  crypto.randomBytes(24).toString("base64url");

const generateSkinId = (): string =>
  String(Math.floor(1000 + Math.random() * 9000));

export interface CreateClientInput {
  name: string;
  slug?: string;
  skin_id?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  webhook_url?: string;
  timezone?: string;
  meta?: Record<string, unknown> | null;
}

export interface UpdateClientInput {
  name?: string;
  slug?: string;
  skin_id?: string;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  webhook_url?: string | null;
  timezone?: string;
  meta?: Record<string, unknown> | null;
  status?: ClientStatus;
}

const sanitizeSlug = async (
  desired: string,
  excludeId?: string
): Promise<string> => {
  const candidate = slugify(desired);
  if (!candidate) {
    throw new AppError("Slug cannot be empty", 422);
  }
  if (!SLUG_REGEX.test(candidate)) {
    throw new AppError(
      "Slug may only contain lowercase letters, digits and hyphens",
      422
    );
  }

  // Ensure uniqueness — append -2, -3, ... if taken.
  let attempt = candidate;
  for (let n = 2; n <= 50; n++) {
    const existing = await ClientRepository.findBySlug(attempt);
    if (!existing || existing.id === excludeId) return attempt;
    attempt = `${candidate}-${n}`;
  }
  throw new AppError("Unable to generate unique slug", 500);
};

const ensureUniqueSkinId = async (
  skin_id: string,
  excludeId?: string
): Promise<void> => {
  const existing = await ClientRepository.findBySkinId(skin_id);
  if (existing && existing.id !== excludeId) {
    throw new AppError("Skin ID already in use", 409);
  }
};

export const createClientService = async (
  input: CreateClientInput
): Promise<Client> => {
  const slug = await sanitizeSlug(input.slug || input.name);

  let skin_id = input.skin_id?.trim();
  if (skin_id) {
    await ensureUniqueSkinId(skin_id);
  } else {
    // Auto-generate, retry on collision a handful of times.
    for (let i = 0; i < 10; i++) {
      const candidate = generateSkinId();
      const existing = await ClientRepository.findBySkinId(candidate);
      if (!existing) {
        skin_id = candidate;
        break;
      }
    }
    if (!skin_id) throw new AppError("Unable to generate skin id", 500);
  }

  return ClientRepository.create({
    name: input.name.trim(),
    slug,
    skin_id,
    auth_key: generateAuthKey(),
    description: input.description?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    webhook_url: input.webhook_url?.trim() || null,
    timezone: input.timezone?.trim() || "UTC",
    meta: input.meta ?? null,
  });
};

export const listClientsService = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: ClientStatus;
}) => {
  return ClientRepository.paginateClients(params);
};

export const getClientService = async (id: string): Promise<Client> => {
  const client = await ClientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

export const updateClientService = async (
  id: string,
  data: UpdateClientInput
): Promise<Client> => {
  const client = await ClientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const patch: Partial<Client["_creationAttributes"]> = {};

  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.slug !== undefined) {
    patch.slug = await sanitizeSlug(data.slug, id);
  }
  if (data.skin_id !== undefined) {
    const trimmed = data.skin_id.trim();
    await ensureUniqueSkinId(trimmed, id);
    patch.skin_id = trimmed;
  }
  if (data.description !== undefined) patch.description = data.description;
  if (data.contact_email !== undefined) patch.contact_email = data.contact_email;
  if (data.contact_phone !== undefined) patch.contact_phone = data.contact_phone;
  if (data.webhook_url !== undefined) patch.webhook_url = data.webhook_url;
  if (data.timezone !== undefined) patch.timezone = data.timezone;
  if (data.meta !== undefined) patch.meta = data.meta;
  if (data.status !== undefined) patch.status = data.status;

  const updated = await ClientRepository.updateByPk(id, patch);
  if (!updated) throw new AppError("Client not found", 404);
  return updated;
};

export const rotateAuthKeyService = async (id: string): Promise<Client> => {
  const client = await ClientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const updated = await ClientRepository.updateByPk(id, {
    auth_key: generateAuthKey(),
  });
  if (!updated) throw new AppError("Client not found", 404);
  return updated;
};

export const toggleClientStatusService = async (
  id: string
): Promise<Client> => {
  const client = await ClientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);

  const next: ClientStatus = client.status === "ENABLED" ? "DISABLED" : "ENABLED";
  const updated = await ClientRepository.updateByPk(id, { status: next });
  if (!updated) throw new AppError("Client not found", 404);
  return updated;
};

export const deleteClientService = async (id: string): Promise<void> => {
  const client = await ClientRepository.findByPk(id);
  if (!client) throw new AppError("Client not found", 404);
  await ClientRepository.deleteByPk(id);
};
