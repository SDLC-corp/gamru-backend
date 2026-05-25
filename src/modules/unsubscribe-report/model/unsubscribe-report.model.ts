import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type UnsubscribeChannel =
  | "EMAIL"
  | "SMS"
  | "ONSITE"
  | "WEBPUSH"
  | "INAPP";

export class UnsubscribeReport extends Model<
  InferAttributes<UnsubscribeReport>,
  InferCreationAttributes<UnsubscribeReport>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare player_id: string;
  declare campaign_name: CreationOptional<string | null>;
  declare channel: UnsubscribeChannel;
  declare reason: CreationOptional<string | null>;
  declare unsubscribed_at: CreationOptional<Date>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

UnsubscribeReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    player_id: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    campaign_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unsubscribed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "unsubscribe_reports",
    modelName: "UnsubscribeReport",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(UnsubscribeReport);

export default UnsubscribeReport;
