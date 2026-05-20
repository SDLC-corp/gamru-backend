import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type CustomTriggerStatus = "ACTIVE" | "INACTIVE";

export class CustomTrigger extends Model<
  InferAttributes<CustomTrigger>,
  InferCreationAttributes<CustomTrigger>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare trigger: CreationOptional<string | null>;
  declare status: CreationOptional<CustomTriggerStatus>;
  declare description: CreationOptional<string | null>;
  declare tags: CreationOptional<string[] | null>;
  declare builder: CreationOptional<Record<string, unknown> | null>;
  declare created_by: CreationOptional<string | null>;
  declare is_archived: CreationOptional<boolean>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CustomTrigger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    trigger: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "INACTIVE",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    builder: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "custom_triggers",
    modelName: "CustomTrigger",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CustomTrigger;
