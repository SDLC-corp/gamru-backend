import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type TemplateChannel =
  | "EMAIL"
  | "SMS"
  | "ONSITE"
  | "WEBPUSH"
  | "INAPP";

export class Template extends Model<
  InferAttributes<Template>,
  InferCreationAttributes<Template>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare channel: TemplateChannel;
  declare description: CreationOptional<string | null>;
  declare language: CreationOptional<string | null>;
  declare tags: CreationOptional<string[] | null>;
  declare subject: CreationOptional<string | null>;
  declare content: CreationOptional<string | null>;
  declare test_recipients: CreationOptional<string[] | null>;
  declare created_by: CreationOptional<string | null>;
  declare is_archived: CreationOptional<boolean>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Template.init(
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
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"),
      allowNull: false,
      defaultValue: "EMAIL",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    test_recipients: {
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
    tableName: "templates",
    modelName: "Template",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Template;
