import {
  bearer,
  jsonBody,
  obj,
  ok,
  pathParam,
  op,
  PathsObject,
  notFound,
  AnySchema,
} from "./_helpers";

const TAG = "SystemSettings";

export const systemSettingsTag = {
  name: TAG,
  description: "System settings APIs (key/value config + collections)",
};

const PANELS = ["core", "gamification", "mission", "crm", "platform", "widgets"];

/** Build the standard CRUD doc set for a collection sub-resource. */
const collectionPaths = (
  base: string,
  label: string,
  createSchema: Record<string, AnySchema> = {},
  hasBulk = true
): PathsObject => {
  const paths: PathsObject = {
    [`/api/system-settings/${base}`]: {
      get: op({
        tags: [TAG],
        summary: `List ${label}`,
        security: bearer(),
        responses: { "200": ok(`${label} list`) },
      }),
      post: op({
        tags: [TAG],
        summary: `Create ${label} (Admin)`,
        security: bearer(),
        requestBody: Object.keys(createSchema).length ? jsonBody(obj(createSchema)) : undefined,
        responses: { "201": ok(`${label} created`) },
      }),
    },
    [`/api/system-settings/${base}/{id}`]: {
      get: op({
        tags: [TAG],
        summary: `Get one ${label}`,
        security: bearer(),
        parameters: [pathParam("id")],
        responses: { "200": ok(`${label} fetched`), "404": notFound() },
      }),
      put: op({
        tags: [TAG],
        summary: `Update ${label} (Admin)`,
        security: bearer(),
        parameters: [pathParam("id")],
        responses: { "200": ok(`${label} updated`) },
      }),
      delete: op({
        tags: [TAG],
        summary: `Delete ${label} (Admin)`,
        security: bearer(),
        parameters: [pathParam("id")],
        responses: { "200": ok(`${label} deleted`) },
      }),
    },
  };
  if (hasBulk) {
    paths[`/api/system-settings/${base}/bulk`] = {
      put: op({
        tags: [TAG],
        summary: `Bulk replace ${label} (Admin)`,
        security: bearer(),
        responses: { "200": ok(`${label} replaced`) },
      }),
    };
  }
  return paths;
};

export const systemSettingsPaths: PathsObject = {
  "/api/system-settings/settings": {
    get: op({
      tags: [TAG],
      summary: "Get all settings grouped by panel",
      security: bearer(),
      responses: { "200": ok("Settings grouped by panel") },
    }),
  },
  "/api/system-settings/settings/bulk": {
    put: op({
      tags: [TAG],
      summary: "Bulk upsert settings (Admin only)",
      security: bearer(),
      responses: { "200": ok("Settings upserted") },
    }),
  },
  "/api/system-settings/settings/{panel}": {
    get: op({
      tags: [TAG],
      summary: "Get settings for one panel",
      security: bearer(),
      parameters: [pathParam("panel", { type: "string", enum: PANELS })],
      responses: { "200": ok("Panel settings") },
    }),
  },
  "/api/system-settings/settings/{panel}/{key}": {
    get: op({
      tags: [TAG],
      summary: "Get a single setting",
      security: bearer(),
      parameters: [
        pathParam("panel", { type: "string", enum: PANELS }),
        pathParam("key", { type: "string" }),
      ],
      responses: { "200": ok("Setting fetched") },
    }),
    put: op({
      tags: [TAG],
      summary: "Upsert a single setting (Admin only)",
      security: bearer(),
      parameters: [
        pathParam("panel", { type: "string", enum: PANELS }),
        pathParam("key", { type: "string" }),
      ],
      responses: { "200": ok("Setting upserted") },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete a setting (Admin only)",
      security: bearer(),
      parameters: [
        pathParam("panel", { type: "string", enum: PANELS }),
        pathParam("key", { type: "string" }),
      ],
      responses: { "200": ok("Setting deleted") },
    }),
  },
  ...collectionPaths("account-statuses", "Account statuses"),
  ...collectionPaths("payment-methods", "Payment methods"),
  ...collectionPaths("languages", "Languages"),
  ...collectionPaths("oauth-clients", "OAuth clients", {}, false),
  ...collectionPaths("webhooks", "Webhooks", {}, false),
};
