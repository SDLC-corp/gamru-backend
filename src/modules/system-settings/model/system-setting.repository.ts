import { BaseRepository } from "../../../core/models/base.repository";
import SystemSetting, { SettingsPanel } from "./system-setting.model";

class SystemSettingRepository extends BaseRepository<SystemSetting> {
  constructor() {
    super(SystemSetting);
  }

  async findAllSettings() {
    return this.model.findAll({ order: [["panel", "ASC"], ["key", "ASC"]] });
  }

  async findByPanel(panel: SettingsPanel) {
    return this.model.findAll({
      where: { panel },
      order: [["key", "ASC"]],
    });
  }

  async findByPanelAndKey(panel: SettingsPanel, key: string) {
    return this.model.findOne({ where: { panel, key } });
  }

  async upsertOne(panel: SettingsPanel, key: string, value: unknown, description?: string) {
    const existing = await this.findByPanelAndKey(panel, key);
    if (existing) {
      return existing.update({
        value: value as never,
        ...(description !== undefined ? { description } : {}),
      });
    }
    return this.model.create({
      panel,
      key,
      value: value as never,
      description: description ?? null,
    });
  }

  async deleteByPanelAndKey(panel: SettingsPanel, key: string) {
    return this.model.destroy({ where: { panel, key } });
  }
}

export default new SystemSettingRepository();
