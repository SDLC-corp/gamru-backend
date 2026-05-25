import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<"ACTIVE" | "INACTIVE">;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "roles",
    modelName: "Role",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(Role);

export default Role;