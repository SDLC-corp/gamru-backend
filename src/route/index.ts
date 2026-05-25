/**
 * Central API router. Every per-resource router gets mounted here under
 * its `/api/...` prefix, so `app.ts` only has to wire one thing:
 *
 *   app.use("/api", apiRouter);
 *
 * Add a new resource by:
 *   1. dropping its `*.routes.ts` file in this folder
 *   2. importing it below and appending an entry to `apiRoutes`.
 */
import { Router } from "express";

import authRoutes from "./auth.routes";
import tenantRoutes from "./tenant.routes";
import userRoutes from "./user.routes";
import userLogRoutes from "./user-log.routes";
import roleRoutes from "./role.routes";
import systemSettingsRoutes from "./system-settings.routes";
import gamificationTagRoutes from "./gamification-tag.routes";
import mediaDatabaseRoutes from "./media-database.routes";
import casinoCatalogRoutes from "./casino-catalog.routes";
import sportCatalogRoutes from "./sport-catalog.routes";
import gamificationRoutes from "./gamification.routes";
import campaignRoutes from "./campaign.routes";
import segmentRoutes from "./segment.routes";
import templateRoutes from "./template.routes";
import customTriggerRoutes from "./custom-trigger.routes";
import frequencyCapRoutes from "./frequency-cap.routes";
import unsubscribeReportRoutes from "./unsubscribe-report.routes";
import playerDataRoutes from "./player-data.routes";
import playerRoutes from "./player.routes";
import analyticsRoutes from "./analytics.routes";
import integrationRoutes from "./integration.routes";

interface MountedRoute {
  path: string;
  router: Router;
}

const apiRoutes: MountedRoute[] = [
  { path: "/auth", router: authRoutes },
  { path: "/tenants", router: tenantRoutes },
  { path: "/users", router: userRoutes },
  { path: "/user-log", router: userLogRoutes },
  { path: "/roles", router: roleRoutes },
  { path: "/system-settings", router: systemSettingsRoutes },
  { path: "/tags-gamification", router: gamificationTagRoutes },
  { path: "/media-database", router: mediaDatabaseRoutes },
  { path: "/casino-catalog", router: casinoCatalogRoutes },
  { path: "/sport-catalog", router: sportCatalogRoutes },
  { path: "/gamification", router: gamificationRoutes },
  { path: "/campaigns", router: campaignRoutes },
  { path: "/segments", router: segmentRoutes },
  { path: "/templates", router: templateRoutes },
  { path: "/custom-triggers", router: customTriggerRoutes },
  { path: "/frequency-caps", router: frequencyCapRoutes },
  { path: "/unsubscribe-reports", router: unsubscribeReportRoutes },
  { path: "/player-data", router: playerDataRoutes },
  { path: "/players", router: playerRoutes },
  { path: "/analytics", router: analyticsRoutes },
  { path: "/integration", router: integrationRoutes },
];

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

apiRoutes.forEach(({ path, router }) => apiRouter.use(path, router));

export default apiRouter;
