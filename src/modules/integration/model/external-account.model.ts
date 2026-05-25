import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

/**
 * Links an external (gamify-engage) user to a gamru Player. The pair
 * (origin, external_id) is unique; `player_id` is filled once the matching
 * Player is resolved (by email on first sync, usually USER_REGISTERED).
 */
export class ExternalAccount extends Model<
  InferAttributes<ExternalAccount>,
  InferCreationAttributes<ExternalAccount>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare origin: string;
  declare external_id: string;
  declare player_id: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

ExternalAccount.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    origin: { type: DataTypes.STRING(40), allowNull: false },
    external_id: { type: DataTypes.STRING(120), allowNull: false },
    player_id: { type: DataTypes.UUID, allowNull: true },
    email: { type: DataTypes.STRING(180), allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "external_accounts",
    modelName: "ExternalAccount",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(ExternalAccount);

export default ExternalAccount;
