"use strict";

// PHASE 4 — Lockdown.
//
// DO NOT RUN until:
//   • every tenant-scoped model has been updated with applyTenantScope
//   • every existing row has been verified to have a non-NULL tenant_id
//     (run: `SELECT COUNT(*) FROM <table> WHERE tenant_id IS NULL` for each)
//   • prod has been green for ~1 week with the soft (NULLABLE) tenant column
//
// What this does:
//   1. For every tenant-scoped table EXCEPT users: set tenant_id NOT NULL.
//   2. Add foreign-key constraint referencing tenants(id).
//
// Why users is excluded from NOT NULL:
//   SUPER_ADMIN rows must have tenant_id = NULL. The CHECK constraint added
//   in 0026 already enforces correctness ("non-superadmin must have a tenant").
//   We still add the FK on users.tenant_id — NULLs are allowed by an FK.

const TENANT_TABLES_NOT_NULL = [
  // auth & access (users excluded — see above)
  "roles",
  "user_logs",
  // CRM domain
  "segments",
  "templates",
  "campaigns",
  "campaign_analytics",
  "campaign_history",
  "frequency_caps",
  "custom_triggers",
  "unsubscribe_reports",
  // gamification
  "gamification_tags",
  "missions",
  "mission_bundles",
  "ranks",
  "token_rules_casino",
  "token_rules_sports",
  "xp_point_rules_casino",
  "xp_point_rules_sports",
  "player_categories",
  "reward_shop",
  "prizeshark_catalog",
  "purchase_feed",
  "tournaments",
  // media
  "media_database",
  // player domain
  "player_data",
  "players",
  "player_campaign_history",
  "player_rewards",
  "player_logs",
  // catalogs
  "casino_categories",
  "casino_providers",
  "casino_games",
  "sports",
  "sport_tournaments",
  "sport_markets",
  "sport_teams",
  // settings & integrations
  "system_settings",
  "oauth_clients",
  "webhooks",
  "external_accounts",
  "gam_xp_transactions",
];

// Includes users — FK only, not NOT NULL.
const ALL_FK_TABLES = ["users", ...TENANT_TABLES_NOT_NULL];

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Promote tenant_id to NOT NULL on every table that should be tenant-bound.
    for (const table of TENANT_TABLES_NOT_NULL) {
      await queryInterface.changeColumn(table, "tenant_id", {
        type: Sequelize.UUID,
        allowNull: false,
      });
    }

    // 2. Add FK constraints. RESTRICT on delete — never silently delete tenant data.
    for (const table of ALL_FK_TABLES) {
      const fkName = `${table}_tenant_id_fk`;
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = '${fkName}'
          ) THEN
            ALTER TABLE "${table}"
            ADD CONSTRAINT ${fkName}
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id)
            ON UPDATE CASCADE
            ON DELETE RESTRICT;
          END IF;
        END$$;
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Drop FKs.
    for (const table of ALL_FK_TABLES) {
      const fkName = `${table}_tenant_id_fk`;
      await queryInterface.sequelize.query(
        `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS ${fkName};`
      );
    }
    // 2. Revert NOT NULL.
    for (const table of TENANT_TABLES_NOT_NULL) {
      await queryInterface.changeColumn(table, "tenant_id", {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }
  },
};
