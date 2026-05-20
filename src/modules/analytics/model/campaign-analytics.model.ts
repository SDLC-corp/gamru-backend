import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type AnalyticsChannel = "EMAIL" | "SMS" | "WEB_PUSH" | "ONSITE";

export class CampaignAnalytics extends Model<
  InferAttributes<CampaignAnalytics>,
  InferCreationAttributes<CampaignAnalytics>
> {
  declare id: CreationOptional<string>;
  declare campaign_id: string;
  declare channel: AnalyticsChannel;
  declare sent: CreationOptional<number>;
  declare delivered: CreationOptional<number>;
  declare opened: CreationOptional<number>;
  declare clicked: CreationOptional<number>;
  declare sms_parts: CreationOptional<number>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CampaignAnalytics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "WEB_PUSH", "ONSITE"),
      allowNull: false,
    },
    sent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    delivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    opened: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    clicked: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sms_parts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "campaign_analytics",
    modelName: "CampaignAnalytics",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["campaign_id", "channel"] }],
  }
);

export default CampaignAnalytics;
