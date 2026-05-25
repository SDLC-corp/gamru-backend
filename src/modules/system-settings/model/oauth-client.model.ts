import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class OAuthClient extends Model<
  InferAttributes<OAuthClient>,
  InferCreationAttributes<OAuthClient>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare client_id: string;
  declare client_secret: CreationOptional<string | null>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

OAuthClient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    client_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    client_secret: { type: DataTypes.TEXT, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "oauth_clients",
    modelName: "OAuthClient",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(OAuthClient);

export default OAuthClient;
