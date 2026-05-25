"use strict";

// Must match the UUID seeded in 0023-seed-default-tenant.js.
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

// Tables that are tenant-scoped (every row belongs to a tenant).
// Phase 1: tenant_id is added as NULLABLE so the live system keeps working
// while app code is updated. Phase 4 will flip these to NOT NULL + FK.
const TENANT_TABLES = [
  // auth & access
  "users",
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
  // catalogs (assumed per-tenant: each operator curates their own offering)
  "casino_categories",
  "casino_providers",
  "casino_games",
  "sports",
  "sport_tournaments",
  "sport_markets",
  "sport_teams",
  // settings & integrations (per-tenant config)
  "system_settings",
  "oauth_clients",
  "webhooks",
  "external_accounts",
  "gam_xp_transactions",
];

// Intentionally EXCLUDED — true global/lookup data shared by all tenants.
// Revisit if any of these become per-tenant in the future.
//   - account_statuses
//   - payment_methods
//   - languages

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TENANT_TABLES) {
      await queryInterface.addColumn(table, "tenant_id", {
        type: Sequelize.UUID,
        allowNull: true,
      });

      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET tenant_id = :tid WHERE tenant_id IS NULL;`,
        { replacements: { tid: DEFAULT_TENANT_ID } }
      );

      await queryInterface.addIndex(table, ["tenant_id"], {
        name: `${table}_tenant_id_idx`,
      });
    }
  },

  async down(queryInterface) {
    for (const table of TENANT_TABLES) {
      await queryInterface.removeIndex(table, `${table}_tenant_id_idx`);
      await queryInterface.removeColumn(table, "tenant_id");
    }
  },
};
