"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("gamification_tags", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM(
          "mission",
          "ranks",
          "reward-shop",
          "token-rules",
          "tournaments",
          "xp-points"
        ),
        allowNull: false,
      },
      created_by: {
        type: Sequelize.STRING(150),
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

    await queryInterface.addIndex("gamification_tags", ["category"], {
      name: "idx_gamification_tags_category",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("gamification_tags");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_gamification_tags_category";'
    );
  },
};
