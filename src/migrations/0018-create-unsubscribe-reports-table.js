"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("unsubscribe_reports", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      campaign_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
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
    await queryInterface.dropTable("unsubscribe_reports");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_unsubscribe_reports_channel";'
    );
  },
};
