import {
  bearer,
  jsonBody,
  obj,
  ok,
  queryParam,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "UnsubscribeReports";

export const unsubscribeReportTag = {
  name: TAG,
  description: "CRM Unsubscribe report APIs",
};

const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];

export const unsubscribeReportPaths: PathsObject = {
  "/api/unsubscribe-reports/add": {
    post: op({
      tags: [TAG],
      summary: "Record a player unsubscribe event",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            player_id: { type: "string" },
            campaign_name: { type: "string" },
            channel: { type: "string", enum: CHANNELS },
            reason: { type: "string" },
          },
          ["player_id", "channel"]
        )
      ),
      responses: { "200": ok("Unsubscribe record created successfully") },
    }),
  },
  "/api/unsubscribe-reports/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated unsubscribe reports",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer" }),
        queryParam("limit", { type: "integer" }),
        queryParam("campaign_name", { type: "string" }),
        queryParam("player_id", { type: "string" }),
        queryParam("channel", { type: "string" }),
        queryParam(
          "days",
          { type: "integer" },
          "Lookback window in days; omit for Lifetime"
        ),
      ],
      responses: { "200": ok("Paginated unsubscribe reports") },
    }),
  },
};
