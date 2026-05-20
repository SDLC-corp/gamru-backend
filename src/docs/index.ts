/**
 * Central swagger registry — imports the per-module `*.docs.ts` files and
 * merges them into a single OpenAPI spec consumed by `config/swagger.ts`.
 *
 * To document a new module: add `<module>.docs.ts`, then register its tag
 * + paths here. Routes stay free of JSDoc swagger comments.
 */

import { authTag, authPaths } from "./auth.docs";
import { userTag, userPaths } from "./user.docs";
import { userLogTag, userLogPaths } from "./user-log.docs";
import { roleTag, rolePaths } from "./role.docs";
import { systemSettingsTag, systemSettingsPaths } from "./system-settings.docs";
import { gamificationTagTag, gamificationTagPaths } from "./gamification-tag.docs";
import { mediaDatabaseTag, mediaDatabasePaths } from "./media-database.docs";
import { casinoCatalogTag, casinoCatalogPaths } from "./casino-catalog.docs";
import { sportCatalogTag, sportCatalogPaths } from "./sport-catalog.docs";
import { gamificationTag, gamificationPaths } from "./gamification.docs";
import { campaignTag, campaignPaths } from "./campaign.docs";
import { segmentTag, segmentPaths } from "./segment.docs";
import { templateTag, templatePaths } from "./template.docs";
import { customTriggerTag, customTriggerPaths } from "./custom-trigger.docs";
import { frequencyCapTag, frequencyCapPaths } from "./frequency-cap.docs";
import { unsubscribeReportTag, unsubscribeReportPaths } from "./unsubscribe-report.docs";
import { playerDataTag, playerDataPaths } from "./player-data.docs";
import { playerTag, playerPaths } from "./player.docs";
import { analyticsTag, analyticsPaths } from "./analytics.docs";
import { integrationTag, integrationPaths } from "./integration.docs";

export const allTags = [
  authTag,
  userTag,
  userLogTag,
  roleTag,
  systemSettingsTag,
  gamificationTagTag,
  mediaDatabaseTag,
  casinoCatalogTag,
  sportCatalogTag,
  gamificationTag,
  campaignTag,
  segmentTag,
  templateTag,
  customTriggerTag,
  frequencyCapTag,
  unsubscribeReportTag,
  playerDataTag,
  playerTag,
  analyticsTag,
  integrationTag,
];

export const allPaths = {
  ...authPaths,
  ...userPaths,
  ...userLogPaths,
  ...rolePaths,
  ...systemSettingsPaths,
  ...gamificationTagPaths,
  ...mediaDatabasePaths,
  ...casinoCatalogPaths,
  ...sportCatalogPaths,
  ...gamificationPaths,
  ...campaignPaths,
  ...segmentPaths,
  ...templatePaths,
  ...customTriggerPaths,
  ...frequencyCapPaths,
  ...unsubscribeReportPaths,
  ...playerDataPaths,
  ...playerPaths,
  ...analyticsPaths,
  ...integrationPaths,
};
