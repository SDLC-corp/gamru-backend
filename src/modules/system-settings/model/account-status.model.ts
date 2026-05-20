import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export class AccountStatus extends Model<
  InferAttributes<AccountStatus>,
  InferCreationAttributes<AccountStatus>
> {
  declare id: CreationOptional<string>;
  declare unique_key: string;
  declare display_name: string;
  declare icon: CreationOptional<string | null>;
  declare color: CreationOptional<string | null>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

AccountStatus.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    unique_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    icon: { type: DataTypes.STRING(255), allowNull: true },
    color: { type: DataTypes.STRING(50), allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "account_statuses",
    modelName: "AccountStatus",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AccountStatus;
