"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "timezone", {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: "GMT+04 Samara / Armenia",
    });

    await queryInterface.addColumn("users", "two_factor_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("users", "theme", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "dark",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "timezone");
    await queryInterface.removeColumn("users", "two_factor_enabled");
    await queryInterface.removeColumn("users", "theme");
  },
};
