"use strict";

/**
 * Multi-tenancy: a row in `clientConfig` represents an external
 * organization (brand/skin) that consumes the Gamru platform.
 *
 *   - name        : human-readable display name (e.g. "SDLC Corps")
 *   - slug        : URL-safe identifier, unique (e.g. "sdlc-corps")
 *   - skin_id     : numeric skin id assigned to the brand
 *   - auth_key    : machine-to-machine API key (rotatable)
 *   - status      : ENABLED / DISABLED — soft gate without deletion
 *   - last_seen_at: updated when the client's auth_key is used
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clientConfig", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true,
      },
      skin_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      auth_key: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(180),
        allowNull: true,
      },
      contact_phone: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: "UTC",
      },
      meta: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("ENABLED", "DISABLED"),
        allowNull: false,
        defaultValue: "ENABLED",
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex("clientConfig", ["slug"], {
      unique: true,
      name: "client_config_slug_uq",
    });
    await queryInterface.addIndex("clientConfig", ["skin_id"], {
      unique: true,
      name: "client_config_skin_id_uq",
    });
    await queryInterface.addIndex("clientConfig", ["auth_key"], {
      unique: true,
      name: "client_config_auth_key_uq",
    });
    await queryInterface.addIndex("clientConfig", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("clientConfig");
    // Postgres ENUM types created by Sequelize must be dropped explicitly.
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_clientConfig_status";'
    );
  },
};
