"use strict";

/**
 * Wire the `clients` tenant into the operational rows that previously
 * carried a freeform `origin` string. After this migration every inbound
 * write through the integration surface can be attributed to a Client.
 *
 *  - external_accounts.client_id   (FK; nullable for legacy rows)
 *  - gam_xp_transactions.client_id (FK; nullable for legacy rows)
 *  - players.client_id             (FK; nullable — Player remains
 *                                   global, this records the introducer)
 *  - player_logs.client_id         (FK; nullable)
 *
 * `origin` is intentionally LEFT IN PLACE on external_accounts for now —
 * a follow-up migration can drop it once readers have moved on. Keeping
 * both columns during the rollout lets the new clientAuth and the legacy
 * serviceAuth middlewares run side-by-side for one release.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const addClientId = async (table) => {
      await queryInterface.addColumn(table, "client_id", {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "clients", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addIndex(table, ["client_id"]);
    };

    await addClientId("external_accounts");
    await addClientId("gam_xp_transactions");
    await addClientId("players");
    await addClientId("player_logs");
  },

  async down(queryInterface) {
    const dropClientId = async (table) => {
      // Index name follows Sequelize's default (table_column).
      try {
        await queryInterface.removeIndex(table, [`${table}_client_id`]);
      } catch {
        /* ignore — index may not exist on older runs */
      }
      await queryInterface.removeColumn(table, "client_id");
    };

    await dropClientId("player_logs");
    await dropClientId("players");
    await dropClientId("gam_xp_transactions");
    await dropClientId("external_accounts");
  },
};
