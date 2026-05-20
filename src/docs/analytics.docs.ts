import {
  bearer,
  jsonBody,
  obj,
  ok,
  pathParam,
  queryParam,
  notFound,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "Analytics";

export const analyticsTag = {
  name: TAG,
  description: "CRM Campaign analytics & delivery history APIs",
};

const PERIODS = ["today", "7d", "30d", "lifetime"];

export const analyticsPaths: PathsObject = {
  "/api/analytics/campaigns": {
    get: op({
      tags: [TAG],
      summary: "Paginated per-campaign analytics (Email & SMS channel metrics)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("status", { type: "string" }),
        queryParam("tag", { type: "string" }),
        queryParam("period", { type: "string", enum: PERIODS }),
      ],
      responses: { "200": ok("Campaign analytics list") },
    }),
  },
  "/api/analytics/campaigns/{id}": {
    get: op({
      tags: [TAG],
      summary: "Analytics detail for a single campaign (channel breakdown + recent events)",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Campaign analytics detail"),
        "404": notFound("Campaign not found"),
      },
    }),
  },
  "/api/analytics/history": {
    get: op({
      tags: [TAG],
      summary: "Paginated per-player delivery/engagement history",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("status", { type: "string" }),
        queryParam("channel", { type: "string" }),
        queryParam("period", { type: "string", enum: PERIODS }),
      ],
      responses: { "200": ok("Campaign history list") },
    }),
  },
  "/api/analytics/track": {
    post: op({
      tags: [TAG],
      summary: "Record a delivery/engagement event (drives history + aggregate metrics)",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            campaign_id: { type: "string", format: "uuid" },
            name: { type: "string" },
            player_id: { type: "string" },
            status: {
              type: "string",
              enum: ["SENT", "DELIVERED", "OPEN", "CLICK", "LOGIN", "BOUNCED", "FAILED"],
            },
            channel: { type: "string", enum: ["EMAIL", "SMS", "WEB_PUSH", "ONSITE"] },
            sms_parts: { type: "integer" },
          },
          ["player_id", "status", "channel"]
        )
      ),
      responses: { "200": ok("Event tracked successfully") },
    }),
  },
};
