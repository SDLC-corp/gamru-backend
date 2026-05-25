"use strict";

// Adds SUPER_ADMIN to the users.role ENUM and enforces the invariant
// that every user must belong to a tenant UNLESS they are SUPER_ADMIN.
// Safe to run before the Phase 4 lockdown migration.

module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;

    // 1. Extend the users.role enum (idempotent thanks to IF NOT EXISTS).
    await sql.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    `);

    // 2. CHECK constraint: tenant_id is required for everyone except SUPER_ADMIN.
    //    Wrapped in DO block so re-running this migration is safe.
    await sql.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'users_tenant_required_unless_superadmin'
        ) THEN
          ALTER TABLE "users"
          ADD CONSTRAINT users_tenant_required_unless_superadmin
          CHECK (role = 'SUPER_ADMIN' OR tenant_id IS NOT NULL);
        END IF;
      END$$;
    `);
  },

  async down(queryInterface) {
    const sql = queryInterface.sequelize;
    await sql.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS users_tenant_required_unless_superadmin;
    `);
    // Postgres has no DROP VALUE for enums; leaving SUPER_ADMIN in place
    // is harmless and any attempt to remove it would error on existing rows.
  },
};
