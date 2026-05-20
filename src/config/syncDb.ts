import sequelize from "./db";
import "../modules/user/model/user.model"; // import all models here
import "../modules/casino-catalog/model/casino-game.model";
import "../modules/casino-catalog/model/casino-category.model";
import "../modules/casino-catalog/model/casino-provider.model";
import "../modules/sport-catalog/model/sport.model";
import "../modules/sport-catalog/model/sport-team.model";
import "../modules/sport-catalog/model/sport-tournament.model";
import "../modules/sport-catalog/model/sport-market.model";
import "../modules/gamification/shared/gamification.model";

const syncDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // alter: true safely updates schema without dropping data
    await sequelize.sync({ alter: true });
    console.log("✅ All models synced");

    process.exit(0);
  } catch (error) {
    console.error("❌ DB sync failed:", error);
    process.exit(1);
  }
};

syncDb();
