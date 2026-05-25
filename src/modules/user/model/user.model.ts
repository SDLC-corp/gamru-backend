import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  // tenant_id is NULL only for SUPER_ADMIN. Enforced by DB CHECK in Phase 2 migrations.
  declare tenant_id: CreationOptional<string | null>;
  declare first_name: string;
  declare last_name: string;
  declare username: CreationOptional<string | null>;
  declare email: string;
  declare mobile: string;
  declare password: string;
  declare role: CreationOptional<UserRole>;
  declare access_token: CreationOptional<string | null>;
  declare refresh_token: CreationOptional<string | null>;
  declare status: CreationOptional<"ACTIVE" | "INACTIVE">;
  declare timezone: CreationOptional<string>;
  declare two_factor_enabled: CreationOptional<boolean>;
  declare theme: CreationOptional<string>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Phase 4 flips to NOT NULL via 0027 migration
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN", "SUPER_ADMIN"),
      defaultValue: "USER",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "GMT+04 Samara / Armenia",
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    theme: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "dark",
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: { attributes: { exclude: [] } },
    },
  }
);

// Auto-inject tenant_id on every query/insert against `users`.
// Login lookups need to bypass — see auth.service.ts.
applyTenantScope(User);

export default User;
