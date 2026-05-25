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
 * Account-level activity log for a player — powers the
 * "Account Information → Logs" tab.
 */
export class PlayerLog extends Model<
  InferAttributes<PlayerLog>,
  InferCreationAttributes<PlayerLog>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare player_id: string;
  declare action: string;
  declare detail: CreationOptional<string | null>;
  declare actor: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

PlayerLog.init(
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
    action: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actor: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "player_logs",
    modelName: "PlayerLog",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(PlayerLog);

export default PlayerLog;
