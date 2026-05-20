"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ENUM types first (Postgres specific)
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_role" AS ENUM ('USER', 'ADMIN');
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_users_status" AS ENUM ('ACTIVE', 'INACTIVE');
    `);

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      role: {
        type: "enum_users_role",
        allowNull: false,
        defaultValue: "USER",
      },
      status: {
        type: "enum_users_status",
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");

    // Drop ENUM types (important cleanup)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_role";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_users_status";
    `);
  },
};