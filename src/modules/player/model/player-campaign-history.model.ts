import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type CampaignChannel =
  | "WEB_PUSH"
  | "ON_SITE"
  | "EMAIL"
  | "SMS"
  | "PUSH";

export type CampaignDeliveryStatus =
  | "SENT"
  | "OPEN"
  | "ERROR"
  | "CLICKED"
  | "PENDING";

/**
 * One delivered (or attempted) campaign message to a single player —
 * powers the "Campaign History" tab timeline.
 */
export class PlayerCampaignHistory extends Model<
  InferAttributes<PlayerCampaignHistory>,
  InferCreationAttributes<PlayerCampaignHistory>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare player_id: string;
  declare channel: CampaignChannel;
  declare title: string;
  declare status: CampaignDeliveryStatus;
  declare event_label: CreationOptional<string | null>;
  declare event_at: Date;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

PlayerCampaignHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    player_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM("WEB_PUSH", "ON_SITE", "EMAIL", "SMS", "PUSH"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("SENT", "OPEN", "ERROR", "CLICKED", "PENDING"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    event_label: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    event_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "player_campaign_history",
    modelName: "PlayerCampaignHistory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(PlayerCampaignHistory);

export default PlayerCampaignHistory;
