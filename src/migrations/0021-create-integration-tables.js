"use strict";

/**
 * Cross-backend gamification integration tables.
 *
 *  - external_accounts   : links a gamify-engage user (origin/external_id)
 *                          to a gamru Player so synced XP events land on
 *                          the right profile.
 *  - gam_xp_transactions : append-only idempotency ledger. Every inbound
 *                          sync event is recorded once (UNIQUE event_id),
 *                          so retried/duplicate pushes are no-ops.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("external_accounts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      origin: { type: Sequelize.STRING(40), allowNull: false },
      external_id: { type: Sequelize.STRING(120), allowNull: false },
      player_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "players", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      email: { type: Sequelize.STRING(180), allowNull: true },
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

    await queryInterface.addConstraint("external_accounts", {
      fields: ["origin", "external_id"],
      type: "unique",
      name: "external_accounts_origin_external_id_uq",
    });
    await queryInterface.addIndex("external_accounts", ["player_id"]);
    await queryInterface.addIndex("external_accounts", ["email"]);

    await queryInterface.createTable("gam_xp_transactions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "players", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      event_id: { type: Sequelize.STRING(180), allowNull: false, unique: true },
      event_type: { type: Sequelize.STRING(60), allowNull: false },
      external_id: { type: Sequelize.STRING(120), allowNull: true },
      amount: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      balance_after: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      meta: { type: Sequelize.JSONB, allowNull: true },
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

    await queryInterface.addIndex("gam_xp_transactions", ["player_id"]);
    await queryInterface.addIndex("gam_xp_transactions", ["event_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("gam_xp_transactions");
    await queryInterface.dropTable("external_accounts");
  },
};
