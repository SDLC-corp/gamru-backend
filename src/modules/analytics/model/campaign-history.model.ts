import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type HistoryStatus =
  | "SENT"
  | "DELIVERED"
  | "OPEN"
  | "CLICK"
  | "LOGIN"
  | "BOUNCED"
  | "FAILED";

export type HistoryChannel = "EMAIL" | "SMS" | "WEB_PUSH" | "ONSITE";

export class CampaignHistory extends Model<
  InferAttributes<CampaignHistory>,
  InferCreationAttributes<CampaignHistory>
> {
  declare id: CreationOptional<string>;
  declare campaign_id: CreationOptional<string | null>;
  declare name: string;
  declare player_id: string;
  declare status: HistoryStatus;
  declare channel: HistoryChannel;
  declare event_date: CreationOptional<Date>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CampaignHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    player_id: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "SENT",
        "DELIVERED",
        "OPEN",
        "CLICK",
        "LOGIN",
        "BOUNCED",
        "FAILED"
      ),
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "WEB_PUSH", "ONSITE"),
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "campaign_history",
    modelName: "CampaignHistory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["campaign_id"] },
      { fields: ["player_id"] },
      { fields: ["status"] },
      { fields: ["channel"] },
    ],
  }
);

export default CampaignHistory;
