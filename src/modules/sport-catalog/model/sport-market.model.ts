import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class SportMarket extends Model<
  InferAttributes<SportMarket>,
  InferCreationAttributes<SportMarket>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

SportMarket.init(
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "sport_markets",
    modelName: "SportMarket",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(SportMarket);

export default SportMarket;
