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

const TAG = "Templates";

export const templateTag = {
  name: TAG,
  description: "CRM Template management APIs (Email, SMS, On-site, Web Push, In-App)",
};

const idParam = pathParam("id");
const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];

export const templatePaths: PathsObject = {
  "/api/templates/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new template",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "Welcome Bonus Email" },
            channel: { type: "string", enum: CHANNELS },
            description: { type: "string" },
            language: { type: "string", example: "English" },
            tags: { type: "array", items: { type: "string" } },
            subject: { type: "string" },
            content: { type: "string" },
            test_recipients: { type: "array", items: { type: "string" } },
          },
          ["name", "channel"]
        )
      ),
      responses: { "200": ok("Template created successfully") },
    }),
  },
  "/api/templates/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated templates (supports search, channel, language, tag, archived filters)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("channel", { type: "string" }),
        queryParam("language", { type: "string" }),
        queryParam("tag", { type: "string" }),
        queryParam("archived", { type: "boolean" }),
      ],
      responses: { "200": ok("Paginated templates list") },
    }),
  },
  "/api/templates/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single template by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Template fetched successfully"),
        "404": notFound("Template not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete template by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Template deleted successfully"),
        "404": notFound("Template not found"),
      },
    }),
  },
  "/api/templates/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update template by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Template updated successfully"),
        "404": notFound("Template not found"),
      },
    }),
  },
  "/api/templates/archive/{id}": {
    post: op({
      tags: [TAG],
      summary: "Archive a template",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Template archived successfully") },
    }),
  },
  "/api/templates/restore/{id}": {
    post: op({
      tags: [TAG],
      summary: "Restore an archived template",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Template restored successfully") },
    }),
  },
};
