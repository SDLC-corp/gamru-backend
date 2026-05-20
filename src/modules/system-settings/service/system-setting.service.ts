import SystemSettingRepository from "../model/system-setting.repository";
import { SettingsPanel } from "../model/system-setting.model";
import { AppError } from "../../../utils/AppError";

const VALID_PANELS: SettingsPanel[] = [
  "core",
  "gamification",
  "mission",
  "crm",
  "platform",
  "widgets",
];

const assertPanel = (panel: string): SettingsPanel => {
  if (!VALID_PANELS.includes(panel as SettingsPanel)) {
    throw new AppError(`Invalid panel '${panel}'`, 400);
  }
  return panel as SettingsPanel;
};

export const getAllSettingsService = async () => {
  const rows = await SystemSettingRepository.findAllSettings();
  return rows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
    acc[row.panel] ??= {};
    acc[row.panel][row.key] = row.value;
    return acc;
  }, {});
};

export const getSettingsByPanelService = async (panel: string) => {
  const valid = assertPanel(panel);
  const rows = await SystemSettingRepository.findByPanel(valid);
  return rows.reduce<Record<string, unknown>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
};

export const getSettingService = async (panel: string, key: string) => {
  const valid = assertPanel(panel);
  const row = await SystemSettingRepository.findByPanelAndKey(valid, key);
  if (!row) throw new AppError("Setting not found", 404);
  return { panel: row.panel, key: row.key, value: row.value };
};

export const upsertSettingService = async (
  panel: string,
  key: string,
  value: unknown,
  description?: string
) => {
  const valid = assertPanel(panel);
  const row = await SystemSettingRepository.upsertOne(valid, key, value, description);
  return { panel: row.panel, key: row.key, value: row.value };
};

export const bulkUpsertSettingsService = async (
  items: Array<{ panel: string; key: string; value: unknown; description?: string }>
) => {
  const result = [] as Array<{ panel: string; key: string; value: unknown }>;
  for (const item of items) {
    const valid = assertPanel(item.panel);
    const row = await SystemSettingRepository.upsertOne(
      valid,
      item.key,
      item.value,
      item.description
    );
    result.push({ panel: row.panel, key: row.key, value: row.value });
  }
  return result;
};

export const deleteSettingService = async (panel: string, key: string) => {
  const valid = assertPanel(panel);
  const deleted = await SystemSettingRepository.deleteByPanelAndKey(valid, key);
  if (!deleted) throw new AppError("Setting not found", 404);
  return null;
};
