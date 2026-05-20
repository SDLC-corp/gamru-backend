import {
  bearer,
  jsonBody,
  obj,
  ok,
  pathParam,
  queryParam,
  notFound,
  badRequest,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "Players";

export const playerTag = {
  name: TAG,
  description: "End-customer (player) profiles, history, rewards & logs",
};

const idParam = pathParam("id");

export const playerPaths: PathsObject = {
  "/api/players/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated players (search by player_id/username/name/email; filter by status/country)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 25 }),
        queryParam("search", { type: "string" }),
        queryParam("status", { type: "string" }),
        queryParam("country", { type: "string" }),
      ],
      responses: { "200": ok("Paginated players list") },
    }),
  },
  "/api/players/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new player",
      security: bearer(),
      responses: { "200": ok("Player created successfully") },
    }),
  },
  "/api/players/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single player profile by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Player fetched successfully"),
        "404": notFound("Player not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete player by ID",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Player deleted successfully") },
    }),
  },
  "/api/players/by-email": {
    post: op({
      tags: [TAG],
      summary: "Get player profile by email",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          { email: { type: "string", format: "email" } },
          ["email"]
        )
      ),
      responses: {
        "200": ok("Player fetched successfully"),
        "404": notFound("Player not found"),
      },
    }),
  },
  "/api/players/by-email/add-xp": {
    post: op({
      tags: [TAG],
      summary: "Add XP to a player (by email) and recompute level & rank",
      description:
        "Accumulates the XP delta on the player resolved by email, then recomputes level, rank and xp_to_next from the configured CRM rank ladder and auto-grants any per-level rewards crossed. Uses the same gamification engine as the service sync path.",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            email: { type: "string", format: "email" },
            amount: {
              type: "number",
              example: 150,
              description: "XP delta (non-zero; may be negative)",
            },
          },
          ["email", "amount"]
        )
      ),
      responses: {
        "200": ok("Player XP updated successfully"),
        "400": badRequest("Invalid amount"),
        "404": notFound("Player not found"),
      },
    }),
  },
  "/api/players/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update player by ID",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Player updated successfully") },
    }),
  },
  "/api/players/{id}/campaign-history": {
    get: op({
      tags: [TAG],
      summary: "Paginated campaign delivery history for a player",
      security: bearer(),
      parameters: [
        idParam,
        queryParam("page", { type: "integer" }),
        queryParam("limit", { type: "integer" }),
        queryParam("search", { type: "string" }),
      ],
      responses: { "200": ok("Campaign history fetched") },
    }),
  },
  "/api/players/{id}/rewards": {
    get: op({
      tags: [TAG],
      summary: "Paginated gamification rewards for a player",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Rewards fetched") },
    }),
    post: op({
      tags: [TAG],
      summary: "Add a manual reward to a player",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Manual reward added") },
    }),
  },
  "/api/players/{id}/logs": {
    get: op({
      tags: [TAG],
      summary: "Paginated account activity logs for a player",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Logs fetched") },
    }),
  },
};
