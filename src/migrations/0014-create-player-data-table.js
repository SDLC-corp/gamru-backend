"use strict";

const { randomUUID } = require("crypto");

const SYSTEM_FIELDS = [
  ["Player ID", "STRING"],
  ["Brand ID", "STRING"],
  ["First Name", "STRING"],
  ["Last Name", "STRING"],
  ["Gender", "STRING"],
  ["Phone", "STRING"],
  ["Email", "STRING"],
  ["Country", "STRING"],
  ["Language", "STRING"],
  ["Currency", "STRING"],
  ["Registration Date", "DATE"],
  ["Last Login", "DATE"],
  ["Total Deposit", "NUMBER"],
  ["Email Verified", "BOOLEAN"],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("player_data", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      data_type: {
        type: Sequelize.ENUM("STRING", "BOOLEAN", "NUMBER", "DATE"),
        allowNull: false,
        defaultValue: "STRING",
      },
      data_option: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_custom: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.STRING(150),
        allowNull: true,
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

    const now = new Date();
    await queryInterface.bulkInsert(
      "player_data",
      SYSTEM_FIELDS.map(([name, type]) => ({
        id: randomUUID(),
        name,
        description: null,
        data_type: type,
        data_option: null,
        is_custom: false,
        created_by: "system",
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("player_data");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_player_data_data_type";'
    );
  },
};
