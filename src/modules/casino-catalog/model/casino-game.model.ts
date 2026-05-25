import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export interface DeviceSupport {
  mobile: boolean;
  desktop: boolean;
}

export class CasinoGame extends Model<
  InferAttributes<CasinoGame>,
  InferCreationAttributes<CasinoGame>
> {
  declare id: string;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare provider: string;
  declare category: string;
  declare game_thumbnail: CreationOptional<string | null>;
  declare tournament_widget_thumbnail: CreationOptional<string | null>;
  declare bonus_buy_allow: CreationOptional<boolean>;
  declare device_support: CreationOptional<DeviceSupport>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CasinoGame.init(
  {
    id: {
      type: DataTypes.STRING(150),
      primaryKey: true,
      allowNull: false,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    game_thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    tournament_widget_thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    bonus_buy_allow: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    device_support: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { mobile: false, desktop: false },
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "casino_games",
    modelName: "CasinoGame",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(CasinoGame);

export default CasinoGame;
