"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("campaign_history", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      player_id: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "SENT",
          "DELIVERED",
          "OPEN",
          "CLICK",
          "LOGIN",
          "BOUNCED",
          "FAILED"
        ),
        allowNull: false,
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "WEB_PUSH", "ONSITE"),
        allowNull: false,
      },
      event_date: {
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

    await queryInterface.addIndex("campaign_history", ["campaign_id"]);
    await queryInterface.addIndex("campaign_history", ["player_id"]);
    await queryInterface.addIndex("campaign_history", ["status"]);
    await queryInterface.addIndex("campaign_history", ["channel"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaign_history");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_campaign_history_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_campaign_history_channel";'
    );
  },
};
