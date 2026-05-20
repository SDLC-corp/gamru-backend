import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type FrequencyCapChannel =
  | "EMAIL"
  | "SMS"
  | "ONSITE"
  | "WEBPUSH"
  | "INAPP";

export type FrequencyCapPeriod = "PER_DAY" | "PER_WEEK" | "PER_MONTH";

export class FrequencyCap extends Model<
  InferAttributes<FrequencyCap>,
  InferCreationAttributes<FrequencyCap>
> {
  declare id: CreationOptional<string>;
  declare channel: FrequencyCapChannel;
  declare period: FrequencyCapPeriod;
  declare limit: number;
  declare created_by: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

FrequencyCap.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"),
      allowNull: false,
    },
    period: {
      type: DataTypes.ENUM("PER_DAY", "PER_WEEK", "PER_MONTH"),
      allowNull: false,
      defaultValue: "PER_WEEK",
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "frequency_caps",
    modelName: "FrequencyCap",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default FrequencyCap;
