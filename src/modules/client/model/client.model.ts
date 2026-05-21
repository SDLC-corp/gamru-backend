import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type ClientStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

/** Granular S2S permissions a client may hold. */
export const ALL_CLIENT_SCOPES = [
  "events.write",
  "players.read",
  "xp.write",
  "users.write",
] as const;

export type ClientScope = (typeof ALL_CLIENT_SCOPES)[number];

/**
 * A Client represents one consuming platform (e.g. "Gamify Engage") that
 * integrates with Gamru's service surface. The (client_id, client_secret)
 * pair authenticates every service-to-service call; `service_scopes`
 * restricts what each client may do; `last_seen_at` and `last_seen_ip`
 * are bumped on every authenticated hit so the admin UI can show usage.
 *
 * `client_secret_hash` is bcrypt(secret). The plaintext secret is only
 * ever returned at issuance (or rotation) time and is never stored.
 */
export class Client extends Model<
  InferAttributes<Client>,
  InferCreationAttributes<Client>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare slug: string;
  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<ClientStatus>;

  declare client_id: string;
  declare client_secret_hash: string;

  declare service_scopes: CreationOptional<string[]>;
  declare ip_allowlist: CreationOptional<string[] | null>;
  declare rate_limit_per_minute: CreationOptional<number>;

  declare webhook_url: CreationOptional<string | null>;
  declare webhook_secret_hash: CreationOptional<string | null>;

  declare contact_email: CreationOptional<string | null>;
  declare last_seen_at: CreationOptional<Date | null>;
  declare last_seen_ip: CreationOptional<string | null>;

  declare created_by: CreationOptional<string | null>;
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
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "ARCHIVED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    client_id: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    client_secret_hash: { type: DataTypes.TEXT, allowNull: false },

    service_scopes: {
      type: DataTypes.ARRAY(DataTypes.STRING(60)),
      allowNull: false,
      defaultValue: [],
    },
    ip_allowlist: {
      type: DataTypes.ARRAY(DataTypes.STRING(64)),
      allowNull: true,
    },
    rate_limit_per_minute: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 600,
    },

    webhook_url: { type: DataTypes.STRING(500), allowNull: true },
    webhook_secret_hash: { type: DataTypes.TEXT, allowNull: true },

    contact_email: { type: DataTypes.STRING(180), allowNull: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: true },
    last_seen_ip: { type: DataTypes.STRING(64), allowNull: true },

    created_by: { type: DataTypes.UUID, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "clients",
    modelName: "Client",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    defaultScope: {
      // Never leak the hashed secrets in API responses by default.
      attributes: { exclude: ["client_secret_hash", "webhook_secret_hash"] },
    },
    scopes: {
      withSecret: { attributes: { include: ["client_secret_hash"] } },
    },
  }
);

export default Client;
