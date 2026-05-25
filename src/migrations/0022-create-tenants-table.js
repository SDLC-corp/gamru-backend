"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_tenants_status" AS ENUM ('ACTIVE','SUSPENDED','DELETED');
    `);

    await queryInterface.createTable("tenants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      subdomain: {
        type: Sequelize.STRING(80),
        allowNull: true,
        unique: true,
      },
      plan: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "STANDARD",
      },
      status: {
        type: "enum_tenants_status",
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addIndex("tenants", ["status"], {
      name: "tenants_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tenants");
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_tenants_status";
    `);
  },
};
