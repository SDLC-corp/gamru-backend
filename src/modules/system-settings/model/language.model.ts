import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export class Language extends Model<
  InferAttributes<Language>,
  InferCreationAttributes<Language>
> {
  declare id: CreationOptional<string>;
  declare language: string;
  declare flag: CreationOptional<string | null>;
  declare flag_emoji: CreationOptional<string | null>;
  declare is_default: CreationOptional<boolean>;
  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Language.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    language: { type: DataTypes.STRING(50), allowNull: false },
    flag: { type: DataTypes.STRING(50), allowNull: true },
    flag_emoji: { type: DataTypes.STRING(10), allowNull: true },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "languages",
    modelName: "Language",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Language;
