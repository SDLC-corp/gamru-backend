"use strict";

// Fixed UUID — referenced by 0024 backfill and by app-side fallback logic.
// If you ever change this, you must also change DEFAULT_TENANT_ID
// in 0024-add-tenant-id-to-business-tables.js.
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("tenants", [
      {
        id: DEFAULT_TENANT_ID,
        name: "Default",
        slug: "default",
        subdomain: null,
        plan: "STANDARD",
        status: "ACTIVE",
        settings: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("tenants", { id: DEFAULT_TENANT_ID });
  },
};
