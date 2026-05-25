import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class CasinoCategory extends Model<
  InferAttributes<CasinoCategory>,
  InferCreationAttributes<CasinoCategory>
> {
  declare id: string;
  declare tenant_id: CreationOptional<string>;
  declare name: string;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CasinoCategory.init(
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "casino_categories",
    modelName: "CasinoCategory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(CasinoCategory);

export default CasinoCategory;
