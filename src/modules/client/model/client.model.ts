import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type ClientStatus = "ENABLED" | "DISABLED";

export class Client extends Model<
  InferAttributes<Client>,
  InferCreationAttributes<Client>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare skin_id: string;
  declare auth_key: string;
  declare description: CreationOptional<string | null>;
  declare contact_email: CreationOptional<string | null>;
  declare contact_phone: CreationOptional<string | null>;
  declare webhook_url: CreationOptional<string | null>;
  declare timezone: CreationOptional<string>;
  declare meta: CreationOptional<Record<string, unknown> | null>;
  declare status: CreationOptional<ClientStatus>;
  declare last_seen_at: CreationOptional<Date | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Client.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    skin_id: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    auth_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    webhook_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "UTC",
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ENABLED", "DISABLED"),
      allowNull: false,
      defaultValue: "ENABLED",
    },
    last_seen_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "clients",
    modelName: "Client",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Client;
