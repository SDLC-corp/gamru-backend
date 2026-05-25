import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export type SegmentType = "DYNAMIC" | "STATIC";

export class Segment extends Model<
  InferAttributes<Segment>,
  InferCreationAttributes<Segment>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare type: CreationOptional<SegmentType>;
  declare description: CreationOptional<string | null>;
  declare tags: CreationOptional<string[] | null>;
  declare content: CreationOptional<Record<string, unknown> | null>;
  declare player_count: CreationOptional<number>;
  declare last_counted_at: CreationOptional<Date | null>;
  declare created_by: CreationOptional<string | null>;
  declare is_archived: CreationOptional<boolean>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

Segment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Phase 4 → NOT NULL
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("DYNAMIC", "STATIC"),
      defaultValue: "DYNAMIC",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    player_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_counted_at: {
      type: DataTypes.DATE,
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
    tableName: "segments",
    modelName: "Segment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Every query / insert / update / delete on `segments` is now
// automatically filtered & stamped with the current request's tenant_id.
applyTenantScope(Segment);

export default Segment;
