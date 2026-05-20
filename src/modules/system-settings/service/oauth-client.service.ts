import OAuthClientRepository from "../model/oauth-client.repository";
import { AppError } from "../../../utils/AppError";

export interface OAuthClientInput {
  name: string;
  description?: string | null;
  client_id: string;
  client_secret?: string | null;
}

export const listOAuthClientsService = async () => {
  return OAuthClientRepository.findAllOrdered();
};

export const getOAuthClientService = async (id: string) => {
  const row = await OAuthClientRepository.findByPk(id);
  if (!row) throw new AppError("OAuth client not found", 404);
  return row;
};

export const createOAuthClientService = async (data: OAuthClientInput) => {
  const existing = await OAuthClientRepository.findByClientId(data.client_id);
  if (existing) throw new AppError("OAuth client_id already exists", 409);
  return OAuthClientRepository.create(data);
};

export const updateOAuthClientService = async (
  id: string,
  data: Partial<OAuthClientInput>
) => {
  const updated = await OAuthClientRepository.updateByPk(id, data);
  if (!updated) throw new AppError("OAuth client not found", 404);
  return updated;
};

export const deleteOAuthClientService = async (id: string) => {
  const ok = await OAuthClientRepository.deleteByPk(id);
  if (!ok) throw new AppError("OAuth client not found", 404);
  return null;
};
