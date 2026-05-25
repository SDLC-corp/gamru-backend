import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type PlayerDataType = "STRING" | "BOOLEAN" | "NUMBER" | "DATE";

export class PlayerData extends Model<
  InferAttributes<PlayerData>,
  InferCreationAttributes<PlayerData>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare data_type: PlayerDataType;
  declare data_option: CreationOptional<string | null>;
  declare is_custom: CreationOptional<boolean>;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

PlayerData.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_type: {
      type: DataTypes.ENUM("STRING", "BOOLEAN", "NUMBER", "DATE"),
      allowNull: false,
      defaultValue: "STRING",
    },
    data_option: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_custom: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "player_data",
    modelName: "PlayerData",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(PlayerData);

export default PlayerData;
