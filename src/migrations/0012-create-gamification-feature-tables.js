"use strict";

const TABLES = [
  "missions",
  "mission_bundles",
  "ranks",
  "token_rules_casino",
  "token_rules_sports",
  "xp_point_rules_casino",
  "xp_point_rules_sports",
  "player_categories",
  "reward_shop",
  "prizeshark_catalog",
  "purchase_feed",
  "tournaments",
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.createTable(table, {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: { type: Sequelize.STRING(200), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        status: {
          type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
          allowNull: false,
          defaultValue: "INACTIVE",
        },
        archived: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        priority: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        tags: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: [],
        },
        data: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        created_by: { type: Sequelize.STRING(150), allowNull: true },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });

      await queryInterface.addIndex(table, ["archived"], {
        name: `idx_${table}_archived`,
      });
      await queryInterface.addIndex(table, ["status"], {
        name: `idx_${table}_status`,
      });
    }
  },

  async down(queryInterface) {
    for (const table of [...TABLES].reverse()) {
      await queryInterface.dropTable(table);
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_${table}_status";`
      );
    }
  },
};
