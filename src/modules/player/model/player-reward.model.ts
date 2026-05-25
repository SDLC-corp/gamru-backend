import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type RewardStatus =
  | "IN_PROGRESS"
  | "GRANTED"
  | "EXPIRED"
  | "CANCELLED";

/**
 * A gamification reward granted to a player (auto via missions/ranks or
 * manually via the "Manual Reward" action) — powers the Gamification tab.
 */
export class PlayerReward extends Model<
  InferAttributes<PlayerReward>,
  InferCreationAttributes<PlayerReward>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare player_id: string;
  declare status: CreationOptional<RewardStatus>;
  declare granted_date: CreationOptional<Date | null>;
  declare gamification_source: CreationOptional<string | null>;
  declare reward_type: CreationOptional<string | null>;
  declare reward: CreationOptional<string | null>;
  declare is_manual: CreationOptional<boolean>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

PlayerReward.init(
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
    status: {
      type: DataTypes.ENUM("IN_PROGRESS", "GRANTED", "EXPIRED", "CANCELLED"),
      defaultValue: "IN_PROGRESS",
    },
    granted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gamification_source: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    reward_type: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    reward: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    is_manual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "player_rewards",
    modelName: "PlayerReward",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(PlayerReward);

export default PlayerReward;
