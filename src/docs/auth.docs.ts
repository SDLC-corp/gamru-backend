import { jsonBody, obj, ok, badRequest, conflict, op, unauthorized, validationFailed, PathsObject } from "./_helpers";

const TAG = "Auth";

export const authTag = {
  name: TAG,
  description: "Authentication APIs (register / login / reset password)",
};

export const authPaths: PathsObject = {
  "/api/auth/register": {
    post: op({
      tags: [TAG],
      summary: "Register a new user",
      requestBody: jsonBody(
        obj(
          {
            first_name: { type: "string", example: "John" },
            last_name: { type: "string", example: "Doe" },
            email: { type: "string", example: "john@example.com" },
            password: { type: "string", example: "secret123" },
            mobile: { type: "string", example: "9876543210" },
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
  "/api/auth/login": {
    post: op({
      tags: [TAG],
      summary: "Login",
      requestBody: jsonBody(
        obj(
          {
            email: { type: "string", example: "admin@test.com" },
            password: { type: "string", example: "test@123" },
          },
          ["email", "password"]
        )
      ),
      responses: {
        "200": ok("Login successful"),
        "401": unauthorized("Invalid credentials"),
        "422": validationFailed(),
      },
    }),
  },
  "/api/auth/reset-password": {
    post: op({
      tags: [TAG],
      summary: "Reset password",
      requestBody: jsonBody(
        obj(
          {
            email: { type: "string", example: "john@example.com" },
            token: {
              type: "string",
              example: "your-reset-token",
              nullable: true,
              description: "Optional reset token",
            },
            new_password: { type: "string", example: "sample@123" },
          },
          ["email", "new_password"]
        )
      ),
      responses: {
        "200": ok("Password reset successful"),
        "400": badRequest("Invalid token or email"),
        "422": validationFailed(),
      },
    }),
  },
};
