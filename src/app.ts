import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./route";
import { UPLOAD_DIR } from "./middlewares/upload.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { swaggerSpec } from "./config/swagger";
import { initAssociations } from "./config/associations";

dotenv.config();

const app = express();

// ─── Security & Utils ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initAssociations();

// ─── Static Uploads ────────────────────────────────────────────────
app.use("/uploads", express.static(UPLOAD_DIR));

// ─── Swagger Docs ──────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ─── 404 ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

export default app;
