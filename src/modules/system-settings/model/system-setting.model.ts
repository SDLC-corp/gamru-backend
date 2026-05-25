import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type SettingsPanel =
  | "core"
  | "gamification"
  | "mission"
  | "crm"
  | "platform"
  | "widgets";

export class SystemSetting extends Model<
  InferAttributes<SystemSetting>,
  InferCreationAttributes<SystemSetting>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare panel: SettingsPanel;
  declare key: string;
  declare value: CreationOptional<unknown>;
  declare description: CreationOptional<string | null>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    panel: {
      type: DataTypes.ENUM(
        "core",
        "gamification",
        "mission",
        "crm",
        "platform",
        "widgets"
      ),
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "system_settings",
    modelName: "SystemSetting",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["tenant_id", "panel", "key"] }],
  }
);

applyTenantScope(SystemSetting);

export default SystemSetting;
