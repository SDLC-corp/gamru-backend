import {
  bearer,
  jsonBody,
  obj,
  ok,
  pathParam,
  queryParam,
  notFound,
  conflict,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "Roles";

export const roleTag = {
  name: TAG,
  description: "Role management APIs",
};

export const rolePaths: PathsObject = {
  "/api/roles/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new role (Admin only)",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "MANAGER" },
            description: { type: "string", example: "Manager role with limited access" },
          },
          ["name"]
        )
      ),
      responses: {
        "201": ok("Role created successfully"),
        "409": conflict("Role already exists"),
      },
    }),
  },
  "/api/roles": {
    get: op({
      tags: [TAG],
      summary: "Get all roles (Admin only)",
      security: bearer(),
      responses: { "200": ok("List of roles") },
    }),
  },
  "/api/roles/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated roles (Admin only)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
      ],
      responses: { "200": ok("Paginated roles list") },
    }),
  },
  "/api/roles/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update role by ID (Admin only)",
      security: bearer(),
      parameters: [pathParam("id")],
      requestBody: jsonBody(
        obj({
          name: { type: "string", example: "MANAGER" },
          description: { type: "string", example: "Updated role description" },
          status: { type: "string", example: "ACTIVE" },
        })
      ),
      responses: {
        "200": ok("Role updated successfully"),
        "404": notFound("Role not found"),
      },
    }),
  },
  "/api/roles/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete role by ID (Admin only)",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Role deleted successfully"),
        "404": notFound("Role not found"),
      },
    }),
  },
};
