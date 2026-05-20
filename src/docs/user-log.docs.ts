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
  badRequest,
} from "./_helpers";

const TAG = "User Logs";

export const userLogTag = {
  name: TAG,
  description: "Audit logs management APIs",
};

const ACTIONS = ["INSERT", "UPDATE", "DELETE", "LOGIN"];

export const userLogPaths: PathsObject = {
  "/api/user-log/add": {
    post: op({
      tags: [TAG],
      summary: "Create a user log",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            user_id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            action: { type: "string", enum: ACTIONS, example: "INSERT" },
            product: { type: "string", example: "CRM" },
            sub_product: { type: "string", example: "USER_MODULE" },
            subject: { type: "string", example: "User created" },
            details: { type: "string", example: "Created new user successfully" },
            old_data: { type: "object", example: {} },
            new_data: {
              type: "object",
              example: {
                id: "u_101",
                name: "Akshay Ghugare",
                email: "akshay@example.com",
                role: "ADMIN",
              },
            },
          },
          ["user_id", "action"]
        )
      ),
      responses: {
        "201": ok("Log created successfully"),
        "400": badRequest("Validation error"),
      },
    }),
  },
  "/api/user-log": {
    get: op({
      tags: [TAG],
      summary: "Get all logs (Admin only)",
      security: bearer(),
      responses: { "200": ok("List of logs") },
    }),
  },
  "/api/user-log/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated logs with filters",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("user_id", { type: "string", format: "uuid" }),
        queryParam("action", { type: "string", enum: ACTIONS }),
        queryParam("product", { type: "string" }),
      ],
      responses: { "200": ok("Paginated logs fetched successfully") },
    }),
  },
  "/api/user-log/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get log by ID",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Log details"),
        "404": notFound("Log not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete log (Admin only - not recommended)",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Log deleted successfully"),
        "404": notFound("Log not found"),
      },
    }),
  },
  "/api/user-log/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update log (Admin only - not recommended)",
      security: bearer(),
      parameters: [pathParam("id")],
      requestBody: jsonBody(
        obj({
          action: { type: "string", example: "UPDATE" },
          product: { type: "string", example: "CRM" },
          subject: { type: "string", example: "Updated user info" },
          details: { type: "string", example: "User updated successfully" },
        })
      ),
      responses: {
        "200": ok("Log updated successfully"),
        "404": notFound("Log not found"),
      },
    }),
  },
};
