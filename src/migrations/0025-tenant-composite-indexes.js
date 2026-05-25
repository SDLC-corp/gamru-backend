"use strict";

// Per-tenant uniqueness. Existing global UNIQUE constraints on columns
// like users.email / users.mobile / roles.name need to become unique
// only within a tenant — otherwise two tenants can never share an email.
//
// Uses raw SQL with IF EXISTS / IF NOT EXISTS so this migration is safe
// to re-run and tolerant of slightly different Sequelize-generated
// constraint names across environments.
//
// Composite secondary indexes are also added here for the common
// (tenant_id, status) and (tenant_id, created_at) query shapes.

module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;

    // --- users: email / mobile / username become per-tenant unique ---
    await sql.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";`);
    await sql.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_mobile_key";`);
    await sql.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_key";`);

    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_email_uq"
      ON "users" (tenant_id, lower(email));
    `);
    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_mobile_uq"
      ON "users" (tenant_id, mobile);
    `);
    // username is nullable — partial index so multiple NULLs are allowed.
    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_username_uq"
      ON "users" (tenant_id, lower(username))
      WHERE username IS NOT NULL;
    `);

    // --- roles: role name unique per tenant ---
    await sql.query(`ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_name_key";`);
    await sql.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "roles_tenant_name_uq"
      ON "roles" (tenant_id, lower(name));
    `);

    // --- secondary composite indexes for the hottest query paths ---
    // Pattern: most list endpoints filter by tenant_id + status, ordered by created_at DESC.
    const COMPOSITES = [
      { table: "users",                cols: ["tenant_id", "status"] },
      { table: "campaigns",            cols: ["tenant_id", "status"] },
      { table: "campaigns",            cols: ["tenant_id", "created_at"] },
      { table: "segments",             cols: ["tenant_id", "status"] },
      { table: "templates",            cols: ["tenant_id", "status"] },
      { table: "players",              cols: ["tenant_id", "created_at"] },
      { table: "player_logs",          cols: ["tenant_id", "created_at"] },
      { table: "player_campaign_history", cols: ["tenant_id", "created_at"] },
      { table: "user_logs",            cols: ["tenant_id", "created_at"] },
      { table: "campaign_analytics",   cols: ["tenant_id", "created_at"] },
      { table: "campaign_history",     cols: ["tenant_id", "created_at"] },
      { table: "unsubscribe_reports",  cols: ["tenant_id", "created_at"] },
      { table: "gam_xp_transactions",  cols: ["tenant_id", "created_at"] },
    ];

    for (const { table, cols } of COMPOSITES) {
      const name = `${table}_${cols.join("_")}_idx`;
      const colList = cols.map((c) => `"${c}"`).join(", ");
      await sql.query(
        `CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${colList});`
      );
    }
  },

  async down(queryInterface) {
    const sql = queryInterface.sequelize;

    // Drop composite secondary indexes
    const COMPOSITES = [
      "users_tenant_id_status_idx",
      "campaigns_tenant_id_status_idx",
      "campaigns_tenant_id_created_at_idx",
      "segments_tenant_id_status_idx",
      "templates_tenant_id_status_idx",
      "players_tenant_id_created_at_idx",
      "player_logs_tenant_id_created_at_idx",
      "player_campaign_history_tenant_id_created_at_idx",
      "user_logs_tenant_id_created_at_idx",
      "campaign_analytics_tenant_id_created_at_idx",
      "campaign_history_tenant_id_created_at_idx",
      "unsubscribe_reports_tenant_id_created_at_idx",
      "gam_xp_transactions_tenant_id_created_at_idx",
    ];
    for (const idx of COMPOSITES) {
      await sql.query(`DROP INDEX IF EXISTS "${idx}";`);
    }

    // Drop tenant-scoped uniques
    await sql.query(`DROP INDEX IF EXISTS "users_tenant_email_uq";`);
    await sql.query(`DROP INDEX IF EXISTS "users_tenant_mobile_uq";`);
    await sql.query(`DROP INDEX IF EXISTS "users_tenant_username_uq";`);
    await sql.query(`DROP INDEX IF EXISTS "roles_tenant_name_uq";`);

    // Restore the original global uniques (best-effort — won't succeed
    // if duplicate values now exist across tenants).
    await sql.query(`ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE (email);`);
    await sql.query(`ALTER TABLE "users" ADD CONSTRAINT "users_mobile_key" UNIQUE (mobile);`);
    await sql.query(`ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE (username);`);
    await sql.query(`ALTER TABLE "roles" ADD CONSTRAINT "roles_name_key" UNIQUE (name);`);
  },
};
