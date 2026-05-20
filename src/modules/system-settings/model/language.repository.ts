import { BaseRepository } from "../../../core/models/base.repository";
import Language from "./language.model";

class LanguageRepository extends BaseRepository<Language> {
  constructor() {
    super(Language);
  }

  async findAllOrdered() {
    return this.model.findAll({ order: [["created_at", "ASC"]] });
  }

  async deleteAll() {
    return this.model.destroy({ where: {}, truncate: false });
  }

  async clearDefaults() {
    return this.model.update({ is_default: false }, { where: { is_default: true } });
  }
}

export default new LanguageRepository();
