import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export class Tenant extends Model<
  InferAttributes<Tenant>,
  InferCreationAttributes<Tenant>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare subdomain: CreationOptional<string | null>;
  declare plan: CreationOptional<string>;
  declare status: CreationOptional<TenantStatus>;
  declare settings: CreationOptional<Record<string, unknown>>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    subdomain: { type: DataTypes.STRING(80), allowNull: true, unique: true },
    plan: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "STANDARD" },
    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "DELETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "tenants",
    modelName: "Tenant",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Tenant;
