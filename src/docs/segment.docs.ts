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

const TAG = "Segments";

export const segmentTag = {
  name: TAG,
  description: "CRM Segment management APIs",
};

const idParam = pathParam("id");

export const segmentPaths: PathsObject = {
  "/api/segments/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new segment",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "High Value Players" },
            type: { type: "string", enum: ["DYNAMIC", "STATIC"], example: "DYNAMIC" },
            description: { type: "string", example: "Total Deposit over $300 Last 30 Days" },
            tags: { type: "array", items: { type: "string" } },
            content: { type: "object" },
            player_count: { type: "integer", example: 0 },
          },
          ["name"]
        )
      ),
      responses: { "200": ok("Segment created successfully") },
    }),
  },
  "/api/segments/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated segments (supports search, type, created_by, tag, archived filters)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("type", { type: "string" }),
        queryParam("created_by", { type: "string" }),
        queryParam("tag", { type: "string" }),
        queryParam("archived", { type: "boolean" }),
      ],
      responses: { "200": ok("Paginated segments list") },
    }),
  },
  "/api/segments/creators": {
    get: op({
      tags: [TAG],
      summary: "Get the distinct list of segment creators",
      security: bearer(),
      responses: { "200": ok("Segment creators fetched successfully") },
    }),
  },
  "/api/segments/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single segment by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Segment fetched successfully"),
        "404": notFound("Segment not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete segment by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Segment deleted successfully"),
        "404": notFound("Segment not found"),
      },
    }),
  },
  "/api/segments/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update segment by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Segment updated successfully"),
        "404": notFound("Segment not found"),
      },
    }),
  },
  "/api/segments/archive/{id}": {
    post: op({
      tags: [TAG],
      summary: "Archive a segment",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Segment archived successfully") },
    }),
  },
  "/api/segments/restore/{id}": {
    post: op({
      tags: [TAG],
      summary: "Restore an archived segment",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Segment restored successfully") },
    }),
  },
};
