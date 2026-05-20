import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/db";

// Import all models so Sequelize registers them
import "./modules/user/model/user.model";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected via Sequelize");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    process.exit(1);
  }
};

startServer();
