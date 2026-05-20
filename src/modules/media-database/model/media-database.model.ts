import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export const MEDIA_DATABASE_CATEGORIES = [
  "banners",
  "booster-images",
  "email-templates-assets",
  "joy-saha",
  "mission-bundles",
  "mission-banner",
  "template",
] as const;

export type MediaDatabaseCategory =
  (typeof MEDIA_DATABASE_CATEGORIES)[number];

export class MediaDatabase extends Model<
  InferAttributes<MediaDatabase>,
  InferCreationAttributes<MediaDatabase>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare category: MediaDatabaseCategory;
  declare file_path: string;
  declare file_size: CreationOptional<number | null>;
  declare mime_type: CreationOptional<string | null>;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

MediaDatabase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(...MEDIA_DATABASE_CATEGORIES),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "media_database",
    modelName: "MediaDatabase",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default MediaDatabase;
