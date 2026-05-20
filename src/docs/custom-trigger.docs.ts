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

const TAG = "CustomTriggers";

export const customTriggerTag = {
  name: TAG,
  description: "CRM Custom Trigger management APIs",
};

const idParam = pathParam("id");

export const customTriggerPaths: PathsObject = {
  "/api/custom-triggers/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new custom trigger",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "First Deposit Bonus" },
            trigger: { type: "string", example: "Event: First Deposit" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            builder: { type: "object" },
          },
          ["name"]
        )
      ),
      responses: { "200": ok("Custom trigger created successfully") },
    }),
  },
  "/api/custom-triggers/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated custom triggers (search, trigger, status, tag, archived filters)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("trigger", { type: "string" }),
        queryParam("status", { type: "string" }),
        queryParam("tag", { type: "string" }),
        queryParam("archived", { type: "boolean" }),
      ],
      responses: { "200": ok("Paginated custom triggers list") },
    }),
  },
  "/api/custom-triggers/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single custom trigger by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Custom trigger fetched successfully"),
        "404": notFound("Custom trigger not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete custom trigger by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Custom trigger deleted successfully"),
        "404": notFound("Custom trigger not found"),
      },
    }),
  },
  "/api/custom-triggers/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update custom trigger by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Custom trigger updated successfully"),
        "404": notFound("Custom trigger not found"),
      },
    }),
  },
  "/api/custom-triggers/archive/{id}": {
    post: op({
      tags: [TAG],
      summary: "Archive a custom trigger",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Custom trigger archived successfully") },
    }),
  },
  "/api/custom-triggers/restore/{id}": {
    post: op({
      tags: [TAG],
      summary: "Restore an archived custom trigger",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Custom trigger restored successfully") },
    }),
  },
};
