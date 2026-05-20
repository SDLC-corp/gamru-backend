"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("campaigns", {
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
      type: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "Direct Campaign",
      },
      status: {
        type: Sequelize.ENUM(
          "IN_DESIGN",
          "SENT",
          "SCHEDULED",
          "PAUSED",
          "ARCHIVED"
        ),
        defaultValue: "IN_DESIGN",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      trigger: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      trigger_config: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      segment: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      target_group: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      is_archived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("campaigns");

    // Important: drop ENUM manually (Postgres)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_campaigns_status";'
    );
  },
};
