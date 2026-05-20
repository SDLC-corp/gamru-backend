"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── players ─────────────────────────────────────────────────
    await queryInterface.createTable("players", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      username: { type: Sequelize.STRING(120), allowNull: false },
      name: { type: Sequelize.STRING(150), allowNull: true },
      email: { type: Sequelize.STRING(180), allowNull: true },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE", "BLOCKED", "N/A"),
        defaultValue: "ACTIVE",
      },
      registration_date: { type: Sequelize.DATE, allowNull: true },
      country: { type: Sequelize.STRING(80), allowNull: true },
      city: { type: Sequelize.STRING(80), allowNull: true },
      avatar_url: { type: Sequelize.STRING(400), allowNull: true },
      mobile_number: { type: Sequelize.STRING(40), allowNull: true },
      birthday: { type: Sequelize.DATE, allowNull: true },
      address: { type: Sequelize.STRING(255), allowNull: true },
      language: { type: Sequelize.STRING(40), allowNull: true },
      account_status: { type: Sequelize.STRING(60), allowNull: true },
      gamification_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      level: { type: Sequelize.INTEGER, defaultValue: 1 },
      max_level: { type: Sequelize.INTEGER, defaultValue: 15 },
      xp_points: { type: Sequelize.FLOAT, defaultValue: 0 },
      xp_to_next: { type: Sequelize.FLOAT, defaultValue: 0 },
      rank_name: { type: Sequelize.STRING(60), allowNull: true, defaultValue: "Sprout" },
      tokens: { type: Sequelize.FLOAT, defaultValue: 0 },
      consents: { type: Sequelize.JSONB, allowNull: true },
      personalization: { type: Sequelize.JSONB, allowNull: true },
      player_data: { type: Sequelize.JSONB, allowNull: true },
      custom_data: { type: Sequelize.JSONB, allowNull: true },
      transactional_data: { type: Sequelize.JSONB, allowNull: true },
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

    // ─── player_campaign_history ─────────────────────────────────
    await queryInterface.createTable("player_campaign_history", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "players", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      channel: {
        type: Sequelize.ENUM("WEB_PUSH", "ON_SITE", "EMAIL", "SMS", "PUSH"),
        allowNull: false,
      },
      title: { type: Sequelize.STRING(180), allowNull: false },
      status: {
        type: Sequelize.ENUM("SENT", "OPEN", "ERROR", "CLICKED", "PENDING"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      event_label: { type: Sequelize.STRING(180), allowNull: true },
      event_at: {
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

    // ─── player_rewards ──────────────────────────────────────────
    await queryInterface.createTable("player_rewards", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "players", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("IN_PROGRESS", "GRANTED", "EXPIRED", "CANCELLED"),
        defaultValue: "IN_PROGRESS",
      },
      granted_date: { type: Sequelize.DATE, allowNull: true },
      gamification_source: { type: Sequelize.STRING(120), allowNull: true },
      reward_type: { type: Sequelize.STRING(120), allowNull: true },
      reward: { type: Sequelize.STRING(180), allowNull: true },
      is_manual: { type: Sequelize.BOOLEAN, defaultValue: false },
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

    // ─── player_logs ─────────────────────────────────────────────
    await queryInterface.createTable("player_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      player_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "players", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      action: { type: Sequelize.STRING(150), allowNull: false },
      detail: { type: Sequelize.TEXT, allowNull: true },
      actor: { type: Sequelize.STRING(150), allowNull: true },
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

    await queryInterface.addIndex("player_campaign_history", ["player_id"]);
    await queryInterface.addIndex("player_rewards", ["player_id"]);
    await queryInterface.addIndex("player_logs", ["player_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("player_logs");
    await queryInterface.dropTable("player_rewards");
    await queryInterface.dropTable("player_campaign_history");
    await queryInterface.dropTable("players");

    // Drop ENUM types manually (Postgres)
    const q = queryInterface.sequelize.query.bind(queryInterface.sequelize);
    await q('DROP TYPE IF EXISTS "enum_players_status";');
    await q('DROP TYPE IF EXISTS "enum_player_campaign_history_channel";');
    await q('DROP TYPE IF EXISTS "enum_player_campaign_history_status";');
    await q('DROP TYPE IF EXISTS "enum_player_rewards_status";');
  },
};
