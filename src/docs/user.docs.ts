import {
  bearer,
  jsonBody,
  obj,
  ok,
  conflict,
  pathParam,
  queryParam,
  validationFailed,
  op,
  PathsObject,
  notFound,
  unauthorized,
} from "./_helpers";

const TAG = "Users";

export const userTag = {
  name: TAG,
  description: "User management APIs",
};

export const userPaths: PathsObject = {
  "/api/users/add": {
    post: op({
      tags: [TAG],
      summary: "Add a new user",
      requestBody: jsonBody(
        obj(
          {
            first_name: { type: "string", example: "John" },
            last_name: { type: "string", example: "Doe" },
            email: { type: "string", example: "john@example.com" },
            mobile: { type: "string", example: "9876543210" },
            password: { type: "string", example: "sample@123" },
            username: { type: "string", example: "johndoe" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
          },
          ["first_name", "last_name", "email", "password", "mobile"]
        )
      ),
      responses: {
        "201": ok("User registered successfully"),
        "409": conflict("Email already exists"),
        "422": validationFailed(),
      },
    }),
  },
  "/api/users/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update user by ID (Admin only)",
      security: bearer(),
      parameters: [pathParam("id")],
      requestBody: jsonBody(
        obj({
          first_name: { type: "string", example: "testuser" },
          last_name: { type: "string", example: "testuser" },
          email: { type: "string", example: "newemail@example.com" },
          mobile: { type: "string", example: "1234567890" },
          username: { type: "string", example: "testuser" },
          role: { type: "string", enum: ["USER", "ADMIN"], example: "ADMIN" },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "INACTIVE" },
        })
      ),
      responses: { "200": ok("User updated") },
    }),
  },
  "/api/users/me": {
    get: op({
      tags: [TAG],
      summary: "Get logged-in user profile",
      security: bearer(),
      responses: {
        "200": ok("Current user profile"),
        "401": unauthorized(),
      },
    }),
    patch: op({
      tags: [TAG],
      summary: "Update logged-in user's own profile (email, username, timezone, theme, 2FA)",
      security: bearer(),
      requestBody: jsonBody(
        obj({
          email: { type: "string", example: "newemail@example.com" },
          username: { type: "string", example: "johnny" },
          timezone: { type: "string", example: "GMT+05:30 India Standard Time" },
          theme: { type: "string", example: "light" },
          two_factor_enabled: { type: "boolean", example: true },
        })
      ),
      responses: {
        "200": ok("Profile updated"),
        "409": conflict("Email or username already in use"),
        "422": validationFailed(),
      },
    }),
  },
  "/api/users/me/change-password": {
    post: op({
      tags: [TAG],
      summary: "Change logged-in user's password",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            current_password: { type: "string", example: "oldPass123" },
            new_password: { type: "string", example: "newPass123" },
          },
          ["current_password", "new_password"]
        )
      ),
      responses: {
        "200": ok("Password changed"),
        "400": ok("Current password incorrect"),
        "422": validationFailed(),
      },
    }),
  },
  "/api/users": {
    get: op({
      tags: [TAG],
      summary: "Get all users (Admin only)",
      security: bearer(),
      responses: {
        "200": ok("List of users"),
        "403": ok("Forbidden"),
      },
    }),
  },
  "/api/users/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated users (Admin only)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
      ],
      responses: { "200": ok("Paginated users list") },
    }),
  },
  "/api/users/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete user by ID (Admin only)",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("User deleted"),
        "404": notFound("User not found"),
      },
    }),
  },
};
