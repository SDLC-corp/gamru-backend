"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("campaign_analytics", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      channel: {
        type: Sequelize.ENUM("EMAIL", "SMS", "WEB_PUSH", "ONSITE"),
        allowNull: false,
      },
      sent: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      delivered: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      opened: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      clicked: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      sms_parts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
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

    await queryInterface.addConstraint("campaign_analytics", {
      fields: ["campaign_id", "channel"],
      type: "unique",
      name: "campaign_analytics_campaign_channel_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaign_analytics");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_campaign_analytics_channel";'
    );
  },
};
