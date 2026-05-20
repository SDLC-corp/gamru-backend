"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const timestamps = {
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
    };

    await queryInterface.createTable("sports", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      ...timestamps,
    });

    await queryInterface.createTable("sport_tournaments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      ...timestamps,
    });

    await queryInterface.createTable("sport_markets", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      ...timestamps,
    });

    await queryInterface.createTable("sport_teams", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      sport: { type: Sequelize.STRING(150), allowNull: true },
      tournament: { type: Sequelize.STRING(150), allowNull: true },
      ...timestamps,
    });

    await queryInterface.addIndex("sport_teams", ["sport"], {
      name: "idx_sport_teams_sport",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sport_teams");
    await queryInterface.dropTable("sport_markets");
    await queryInterface.dropTable("sport_tournaments");
    await queryInterface.dropTable("sports");
  },
};
