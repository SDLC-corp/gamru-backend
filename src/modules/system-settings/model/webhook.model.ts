import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class Webhook extends Model<
  InferAttributes<Webhook>,
  InferCreationAttributes<Webhook>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare url: string;
  declare is_enabled: CreationOptional<boolean>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Webhook.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "webhooks",
    modelName: "Webhook",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(Webhook);

export default Webhook;
