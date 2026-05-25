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
 * A single flexible schema reused by every gamification feature
 * (missions, bundles, ranks, token/xp rules, reward shop, etc.).
 *
 * Common columns are first-class; everything feature-specific
 * (objectives, time settings, rewards, contribution, languages…)
 * lives in the JSONB `data` blob so the multi-step wizards can
 * evolve without migrations.
 */
export class GamificationEntity extends Model<
  InferAttributes<GamificationEntity>,
  InferCreationAttributes<GamificationEntity>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<"ACTIVE" | "INACTIVE">;
  declare archived: CreationOptional<boolean>;
  declare priority: CreationOptional<number>;
  declare tags: CreationOptional<string[]>;
  declare data: CreationOptional<Record<string, unknown>>;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

export const defineGamificationModel = (
  tableName: string,
  modelName: string
): typeof GamificationEntity => {
  class FeatureModel extends GamificationEntity {}

  FeatureModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenant_id: { type: DataTypes.UUID, allowNull: true },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "INACTIVE",
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tags: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_by: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      tableName,
      modelName,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  applyTenantScope(FeatureModel);

  return FeatureModel;
};

// ─── Feature registry ──────────────────────────────────────────────
// key = URL segment used by the frontend, value = { table, model }
export const GAMIFICATION_FEATURES = {
  missions: "missions",
  "mission-bundles": "mission_bundles",
  ranks: "ranks",
  "token-rules-casino": "token_rules_casino",
  "token-rules-sports": "token_rules_sports",
  "xp-point-rules-casino": "xp_point_rules_casino",
  "xp-point-rules-sports": "xp_point_rules_sports",
  "player-categories": "player_categories",
  "reward-shop": "reward_shop",
  "prizeshark-catalog": "prizeshark_catalog",
  "purchase-feed": "purchase_feed",
  tournaments: "tournaments",
} as const;

export type GamificationFeatureKey = keyof typeof GAMIFICATION_FEATURES;

const toModelName = (table: string) =>
  table
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");

export const gamificationModels: Record<
  GamificationFeatureKey,
  typeof GamificationEntity
> = Object.entries(GAMIFICATION_FEATURES).reduce((acc, [key, table]) => {
  acc[key as GamificationFeatureKey] = defineGamificationModel(
    table,
    toModelName(table)
  );
  return acc;
}, {} as Record<GamificationFeatureKey, typeof GamificationEntity>);
