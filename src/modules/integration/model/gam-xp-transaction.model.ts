import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";

/**
 * Append-only idempotency ledger for inbound gamification sync events.
 * `event_id` is UNIQUE — a duplicate push is rejected at insert time so an
 * XP delta is never applied twice.
 */
export class GamXpTransaction extends Model<
  InferAttributes<GamXpTransaction>,
  InferCreationAttributes<GamXpTransaction>
> {
  declare id: CreationOptional<string>;
  declare player_id: CreationOptional<string | null>;
  declare event_id: string;
  declare event_type: string;
  declare external_id: CreationOptional<string | null>;
  declare amount: CreationOptional<number>;
  declare balance_after: CreationOptional<number>;
  declare meta: CreationOptional<Record<string, unknown> | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

GamXpTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    player_id: { type: DataTypes.UUID, allowNull: true },
    event_id: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    event_type: { type: DataTypes.STRING(60), allowNull: false },
    external_id: { type: DataTypes.STRING(120), allowNull: true },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    balance_after: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    meta: { type: DataTypes.JSONB, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "gam_xp_transactions",
    modelName: "GamXpTransaction",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default GamXpTransaction;
