"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("segments", {
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
        type: Sequelize.ENUM("DYNAMIC", "STATIC"),
        defaultValue: "DYNAMIC",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      content: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      player_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_counted_at: {
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
    await queryInterface.dropTable("segments");

    // Important: drop ENUM manually (Postgres)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_segments_type";'
    );
  },
};
