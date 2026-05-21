import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

export type PlayerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "N/A";

/**
 * A Player is an end-customer of the operator (casino/sportsbook).
 * Core/searchable attributes live as real columns; the large, sparse
 * profile/gamification/transactional attribute sets are kept as JSONB
 * so the rich profile UI can render them as key/value cards.
 */
export class Player extends Model<
  InferAttributes<Player>,
  InferCreationAttributes<Player>
> {
  declare id: CreationOptional<string>;
  declare player_id: string;
  declare username: string;
  declare name: CreationOptional<string | null>;
  declare email: CreationOptional<string | null>;
  declare status: CreationOptional<PlayerStatus>;
  declare registration_date: CreationOptional<Date | null>;
  declare country: CreationOptional<string | null>;
  declare city: CreationOptional<string | null>;

  // ─── Profile / sidebar ───────────────────────────────────────────
  declare avatar_url: CreationOptional<string | null>;
  declare mobile_number: CreationOptional<string | null>;
  declare birthday: CreationOptional<Date | null>;
  declare address: CreationOptional<string | null>;
  declare language: CreationOptional<string | null>;
  declare account_status: CreationOptional<string | null>;

  // ─── Gamification summary ────────────────────────────────────────
  declare gamification_active: CreationOptional<boolean>;
  declare level: CreationOptional<number>;
  declare max_level: CreationOptional<number>;
  declare xp_points: CreationOptional<number>;
  declare xp_to_next: CreationOptional<number>;
  declare rank_name: CreationOptional<string | null>;
  declare tokens: CreationOptional<number>;

  // ─── Flexible attribute buckets (rendered as cards) ──────────────
  declare consents: CreationOptional<Record<string, unknown> | null>;
  declare personalization: CreationOptional<Record<string, unknown> | null>;
  declare player_data: CreationOptional<Record<string, unknown> | null>;
  declare custom_data: CreationOptional<Record<string, unknown> | null>;
  declare transactional_data: CreationOptional<Record<string, unknown> | null>;

  /** Tenant introduced by — Client.id. Nullable for players created
   *  by Gamru ops directly. First write wins; never auto-overwritten. */
  declare client_id: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Player.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    player_id: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "BLOCKED", "N/A"),
      defaultValue: "ACTIVE",
    },
    registration_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    account_status: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    gamification_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    max_level: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    xp_points: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    xp_to_next: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    rank_name: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: "Sprout",
    },
    tokens: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    consents: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    personalization: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    player_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    custom_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    transactional_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "players",
    modelName: "Player",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Player;
