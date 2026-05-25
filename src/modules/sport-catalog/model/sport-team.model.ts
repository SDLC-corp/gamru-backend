import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../../config/db";
import { applyTenantScope } from "../../../core/tenant/tenant-scope";

export class SportTeam extends Model<
  InferAttributes<SportTeam>,
  InferCreationAttributes<SportTeam>
> {
  declare id: CreationOptional<string>;
  declare tenant_id: CreationOptional<string>;
  declare name: string;
  declare sport: CreationOptional<string | null>;
  declare tournament: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

SportTeam.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenant_id: { type: DataTypes.UUID, allowNull: true },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    sport: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    tournament: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "sport_teams",
    modelName: "SportTeam",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

applyTenantScope(SportTeam);

export default SportTeam;
