"use strict";

/**
 * Service-product tenants ("clients").
 *
 * Each row represents one consuming platform that integrates with Gamru
 * (e.g. Gamify Engage). The pair (client_id, client_secret) replaces the
 * single shared `SERVICE_SHARED_KEY` for service-to-service auth so we can
 * identify exactly which platform pushed which event, scope what each
 * client may do (`service_scopes`), suspend/rotate independently, and show
 * per-client usage in the Gamru admin UI.
 *
 * `slug` is a short, stable identifier (e.g. "gamify-engage"). It is stamped
 * onto every linked row so the UI can filter by it without an extra join.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clients", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(500), allowNull: true },
      status: {
        type: Sequelize.ENUM("ACTIVE", "SUSPENDED", "ARCHIVED"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      // ─── Auth credentials ─────────────────────────────────────────
      client_id: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      client_secret_hash: { type: Sequelize.TEXT, allowNull: false },

      // ─── Authorization ────────────────────────────────────────────
      service_scopes: {
        type: Sequelize.ARRAY(Sequelize.STRING(60)),
        allowNull: false,
        defaultValue: [],
      },
      ip_allowlist: {
        type: Sequelize.ARRAY(Sequelize.STRING(64)),
        allowNull: true,
      },
      rate_limit_per_minute: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 600,
      },

      // ─── Outbound webhook (optional) ──────────────────────────────
      webhook_url: { type: Sequelize.STRING(500), allowNull: true },
      webhook_secret_hash: { type: Sequelize.TEXT, allowNull: true },

      // ─── Contact / observability ──────────────────────────────────
      contact_email: { type: Sequelize.STRING(180), allowNull: true },
      last_seen_at: { type: Sequelize.DATE, allowNull: true },
      last_seen_ip: { type: Sequelize.STRING(64), allowNull: true },

      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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

    await queryInterface.addIndex("clients", ["status"]);
    await queryInterface.addIndex("clients", ["slug"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("clients");
    // Sequelize creates a backing enum type for ENUM columns on Postgres;
    // drop it explicitly so re-running `up` doesn't fail with
    // "type already exists".
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_clients_status";'
    );
  },
};
