import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export const GAMIFICATION_TAG_CATEGORIES = [
  "mission",
  "ranks",
  "reward-shop",
  "token-rules",
  "tournaments",
  "xp-points",
] as const;

export type GamificationTagCategory =
  (typeof GAMIFICATION_TAG_CATEGORIES)[number];

export class GamificationTag extends Model<
  InferAttributes<GamificationTag>,
  InferCreationAttributes<GamificationTag>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare category: GamificationTagCategory;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

GamificationTag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(...GAMIFICATION_TAG_CATEGORIES),
      allowNull: false,
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
    tableName: "gamification_tags",
    modelName: "GamificationTag",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(GamificationTag);

export default GamificationTag;
