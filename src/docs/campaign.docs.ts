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

const TAG = "Campaigns";

export const campaignTag = {
  name: TAG,
  description: "CRM Campaign management APIs",
};

const idParam = pathParam("id");

export const campaignPaths: PathsObject = {
  "/api/campaigns/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new campaign",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "Welcome Journey" },
            type: { type: "string", example: "Direct Campaign" },
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            trigger: { type: "string", example: "Scheduled - Now" },
            segment: { type: "string", example: "Level -1" },
            start_date: { type: "string", format: "date-time" },
            end_date: { type: "string", format: "date-time" },
          },
          ["name"]
        )
      ),
      responses: { "200": ok("Campaign created successfully") },
    }),
  },
  "/api/campaigns/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated campaigns (supports search, status, trigger, tag, archived filters)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("status", { type: "string" }),
        queryParam("trigger", { type: "string" }),
        queryParam("tag", { type: "string" }),
        queryParam("archived", { type: "boolean" }),
      ],
      responses: { "200": ok("Paginated campaigns list") },
    }),
  },
  "/api/campaigns/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single campaign by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Campaign fetched successfully"),
        "404": notFound("Campaign not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete campaign by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Campaign deleted successfully"),
        "404": notFound("Campaign not found"),
      },
    }),
  },
  "/api/campaigns/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update campaign by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Campaign updated successfully"),
        "404": notFound("Campaign not found"),
      },
    }),
  },
  "/api/campaigns/archive/{id}": {
    post: op({
      tags: [TAG],
      summary: "Archive a campaign",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Campaign archived successfully") },
    }),
  },
  "/api/campaigns/restore/{id}": {
    post: op({
      tags: [TAG],
      summary: "Restore an archived campaign",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Campaign restored successfully") },
    }),
  },
};
