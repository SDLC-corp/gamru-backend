import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type CampaignStatus =
  | "IN_DESIGN"
  | "SENT"
  | "SCHEDULED"
  | "PAUSED"
  | "ARCHIVED";

export class Campaign extends Model<
  InferAttributes<Campaign>,
  InferCreationAttributes<Campaign>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare type: CreationOptional<string>;
  declare status: CreationOptional<CampaignStatus>;
  declare description: CreationOptional<string | null>;
  declare tags: CreationOptional<string[] | null>;
  declare trigger: CreationOptional<string | null>;
  declare trigger_config: CreationOptional<Record<string, unknown> | null>;
  declare segment: CreationOptional<string | null>;
  declare target_group: CreationOptional<Record<string, unknown> | null>;
  declare start_date: CreationOptional<Date | null>;
  declare end_date: CreationOptional<Date | null>;
  declare created_by: CreationOptional<string | null>;
  declare is_archived: CreationOptional<boolean>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Direct Campaign",
    },
    status: {
      type: DataTypes.ENUM(
        "IN_DESIGN",
        "SENT",
        "SCHEDULED",
        "PAUSED",
        "ARCHIVED"
      ),
      defaultValue: "IN_DESIGN",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    trigger: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    trigger_config: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    segment: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    target_group: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "campaigns",
    modelName: "Campaign",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(Campaign);

export default Campaign;
