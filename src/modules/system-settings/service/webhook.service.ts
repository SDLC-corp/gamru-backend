import WebhookRepository from "../model/webhook.repository";
import { AppError } from "../../../utils/AppError";

export interface WebhookInput {
  name: string;
  url: string;
  is_enabled?: boolean;
}

export const listWebhooksService = async () => {
  return WebhookRepository.findAllOrdered();
};

export const getWebhookService = async (id: string) => {
  const row = await WebhookRepository.findByPk(id);
  if (!row) throw new AppError("Webhook not found", 404);
  return row;
};

export const createWebhookService = async (data: WebhookInput) => {
  return WebhookRepository.create(data);
};

export const updateWebhookService = async (id: string, data: Partial<WebhookInput>) => {
  const updated = await WebhookRepository.updateByPk(id, data);
  if (!updated) throw new AppError("Webhook not found", 404);
  return updated;
};

export const deleteWebhookService = async (id: string) => {
  const ok = await WebhookRepository.deleteByPk(id);
  if (!ok) throw new AppError("Webhook not found", 404);
  return null;
};
