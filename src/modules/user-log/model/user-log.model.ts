import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";
import User from "../../user/model/user.model";

export class UserLog extends Model<
  InferAttributes<UserLog>,
  InferCreationAttributes<UserLog>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare user_id: string;

  declare action: "INSERT" | "UPDATE" | "DELETE" | "LOGIN";

  declare product: string | null;
  declare sub_product: string | null;
  declare subject: string | null;
  declare details: string | null;

  declare old_data: object | null;
  declare new_data: object | null;

  declare readonly created_at: CreationOptional<Date>;
}

UserLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM("INSERT", "UPDATE", "DELETE", "LOGIN"),
      allowNull: false,
    },
    product: DataTypes.STRING,
    sub_product: DataTypes.STRING,
    subject: DataTypes.STRING,
    details: DataTypes.TEXT,
    old_data: DataTypes.JSONB,
    new_data: DataTypes.JSONB,
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "user_logs",
    timestamps: false,
  }
);

applyTenantScope(UserLog);

export default UserLog;