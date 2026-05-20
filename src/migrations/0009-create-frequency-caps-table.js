"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("frequency_caps", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"),
        allowNull: false,
      },
      period: {
        type: Sequelize.ENUM("PER_DAY", "PER_WEEK", "PER_MONTH"),
        allowNull: false,
        defaultValue: "PER_WEEK",
      },
      limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("frequency_caps");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_frequency_caps_channel";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_frequency_caps_period";'
    );
  },
};
