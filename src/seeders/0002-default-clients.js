"use strict";

/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require("bcrypt");

/**
 * Seed the first service-product tenant: "Gamify Engage". The legacy
 * `x-service-key` consumer that pre-dates the Client tenancy redesign
 * still works through the clientAuth backward-compat branch — it
 * resolves THIS row by slug "gamify-engage" and stamps writes to it.
 *
 * The plaintext secret is intentionally fixed to the legacy
 * SERVICE_SHARED_KEY env var so existing deployments keep authenticating
 * without coordination. Rotate via `POST /api/clients/:id/rotate-secret`
 * from the admin UI as soon as the consuming platform is migrated to
 * x-client-id + x-client-secret.
 *
 * Idempotent: re-running the seeder is a no-op if a client with this
 * slug already exists.
 */

const SLUG = "gamify-engage";
const NAME = "Gamify Engage";
const CLIENT_ID =
  process.env.GAMIFY_ENGAGE_CLIENT_ID || "cl_legacy_gamify_engage";
const PLAINTEXT_SECRET =
  process.env.SERVICE_SHARED_KEY ||
  process.env.GAMIFY_ENGAGE_CLIENT_SECRET ||
  "hamara-gamify-shared-service-key";

module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM clients WHERE slug = :slug LIMIT 1`,
      {
        replacements: { slug: SLUG },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );
    if (existing) return; // already seeded; nothing to do

    const hash = await bcrypt.hash(PLAINTEXT_SECRET, 10);
    const now = new Date();

    await queryInterface.bulkInsert("clients", [
      {
        id: queryInterface.sequelize.literal("gen_random_uuid()"),
        name: NAME,
        slug: SLUG,
        description:
          "Seed tenant for the first integration (Gamify Engage). " +
          "Created automatically so legacy x-service-key callers keep " +
          "working while they migrate to per-client credentials.",
        status: "ACTIVE",
        client_id: CLIENT_ID,
        client_secret_hash: hash,
        service_scopes: [
          "events.write",
          "players.read",
          "xp.write",
          "users.write",
        ],
        ip_allowlist: null,
        rate_limit_per_minute: 600,
        webhook_url: null,
        webhook_secret_hash: null,
        contact_email: null,
        last_seen_at: null,
        last_seen_ip: null,
        created_by: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    // Backfill: every external_accounts row whose origin is "gamify"
    // belongs to this client. Same for any gam_xp_transactions that
    // joined through those rows by external_id.
    await queryInterface.sequelize.query(
      `UPDATE external_accounts ea
       SET client_id = (SELECT id FROM clients WHERE slug = :slug)
       WHERE ea.origin = 'gamify' AND ea.client_id IS NULL`,
      { replacements: { slug: SLUG } }
    );
    await queryInterface.sequelize.query(
      `UPDATE gam_xp_transactions t
       SET client_id = (SELECT id FROM clients WHERE slug = :slug)
       WHERE t.client_id IS NULL
         AND t.external_id IN (
           SELECT external_id FROM external_accounts WHERE origin = 'gamify'
         )`,
      { replacements: { slug: SLUG } }
    );
    await queryInterface.sequelize.query(
      `UPDATE players p
       SET client_id = (SELECT id FROM clients WHERE slug = :slug)
       WHERE p.client_id IS NULL
         AND p.id IN (
           SELECT player_id FROM external_accounts
            WHERE origin = 'gamify' AND player_id IS NOT NULL
         )`,
      { replacements: { slug: SLUG } }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("clients", { slug: SLUG }, {});
  },
};
