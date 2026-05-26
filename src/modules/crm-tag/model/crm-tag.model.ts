import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export const CRM_TAG_CATEGORIES = [
  "campaign",
  "segment",
  "template",
  "custom-trigger",
  "frequency-cap",
  "unsubscribe-report",
  "player-data",
] as const;

export type CrmTagCategory = (typeof CRM_TAG_CATEGORIES)[number];

export class CrmTag extends Model<
  InferAttributes<CrmTag>,
  InferCreationAttributes<CrmTag>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare category: CrmTagCategory;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

CrmTag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(...CRM_TAG_CATEGORIES),
      allowNull: false,
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
    tableName: "crm_tags",
    modelName: "CrmTag",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CrmTag;
