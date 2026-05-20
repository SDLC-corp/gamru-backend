"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      action: {
        type: Sequelize.ENUM("INSERT", "UPDATE", "DELETE", "LOGIN"),
        allowNull: false,
      },

      product: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      sub_product: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      subject: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      old_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      new_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_logs");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_user_logs_action";'
    );
  },
};