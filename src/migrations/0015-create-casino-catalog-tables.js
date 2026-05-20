"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("casino_categories", {
      id: {
        type: Sequelize.STRING(150),
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
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

    await queryInterface.createTable("casino_providers", {
      id: {
        type: Sequelize.STRING(150),
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
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

    await queryInterface.createTable("casino_games", {
      id: {
        type: Sequelize.STRING(150),
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      provider: { type: Sequelize.STRING(150), allowNull: false },
      category: { type: Sequelize.STRING(150), allowNull: false },
      game_thumbnail: { type: Sequelize.STRING(500), allowNull: true },
      tournament_widget_thumbnail: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      bonus_buy_allow: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      device_support: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { mobile: false, desktop: false },
      },
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

    await queryInterface.addIndex("casino_games", ["provider"], {
      name: "idx_casino_games_provider",
    });
    await queryInterface.addIndex("casino_games", ["category"], {
      name: "idx_casino_games_category",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("casino_games");
    await queryInterface.dropTable("casino_providers");
    await queryInterface.dropTable("casino_categories");
  },
};
