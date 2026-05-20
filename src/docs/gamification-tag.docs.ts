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

const TAG = "GamificationTags";

const CATEGORIES = [
  "mission",
  "ranks",
  "reward-shop",
  "token-rules",
  "tournaments",
  "xp-points",
];

export const gamificationTagTag = {
  name: TAG,
  description: "Gamification tag management APIs",
};

export const gamificationTagPaths: PathsObject = {
  "/api/tags-gamification/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated gamification tags (with search + category filter)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 10 }),
        queryParam("search", { type: "string" }),
        queryParam("category", { type: "string", enum: CATEGORIES }),
      ],
      responses: { "200": ok("Paginated gamification tags") },
    }),
  },
  "/api/tags-gamification/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new gamification tag",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string", example: "Daily Login" },
            description: { type: "string", example: "Tag for daily login missions" },
            category: { type: "string", enum: CATEGORIES },
          },
          ["name", "category"]
        )
      ),
      responses: { "201": ok("Gamification tag created successfully") },
    }),
  },
  "/api/tags-gamification/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update gamification tag by ID",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Gamification tag updated successfully"),
        "404": notFound("Gamification tag not found"),
      },
    }),
  },
  "/api/tags-gamification/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete gamification tag by ID",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Gamification tag deleted successfully"),
        "404": notFound("Gamification tag not found"),
      },
    }),
  },
};
