import {
  bearer,
  ok,
  pathParam,
  queryParam,
  notFound,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "SportCatalog";

export const sportCatalogTag = {
  name: TAG,
  description: "Sport catalog (sports, teams, tournaments, markets) APIs",
};

const idParam = pathParam("id", { type: "string" });

const paginateParams = (extra: ReturnType<typeof queryParam>[] = []) => [
  queryParam("page", { type: "integer", example: 1 }),
  queryParam("limit", { type: "integer", example: 10 }),
  queryParam("search", { type: "string" }),
  ...extra,
];

const simpleCrud = (base: string, label: string): PathsObject => ({
  [`/api/sport-catalog/${base}/paginate`]: {
    get: op({
      tags: [TAG],
      summary: `Get paginated ${label} (search)`,
      security: bearer(),
      parameters: paginateParams(),
      responses: { "200": ok(`Paginated ${label}`) },
    }),
  },
  [`/api/sport-catalog/${base}/add`]: {
    post: op({
      tags: [TAG],
      summary: `Create a new ${label.replace(/s$/, "")}`,
      security: bearer(),
      responses: { "201": ok(`${label} created successfully`) },
    }),
  },
  [`/api/sport-catalog/${base}/update-by/{id}`]: {
    post: op({
      tags: [TAG],
      summary: `Update ${label.replace(/s$/, "")} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} updated successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
  },
  [`/api/sport-catalog/${base}/{id}`]: {
    delete: op({
      tags: [TAG],
      summary: `Delete ${label.replace(/s$/, "")} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} deleted successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
  },
});

export const sportCatalogPaths: PathsObject = {
  ...simpleCrud("sports", "Sports"),
  // Teams have extra sport/tournament filters
  "/api/sport-catalog/teams/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated teams (search + sport/tournament filters)",
      security: bearer(),
      parameters: paginateParams([
        queryParam("sport", { type: "string" }),
        queryParam("tournament", { type: "string" }),
      ]),
      responses: { "200": ok("Paginated teams") },
    }),
  },
  "/api/sport-catalog/teams/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new team",
      security: bearer(),
      responses: { "201": ok("Team created successfully") },
    }),
  },
  "/api/sport-catalog/teams/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update team by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Team updated successfully"),
        "404": notFound("Team not found"),
      },
    }),
  },
  "/api/sport-catalog/teams/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete team by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Team deleted successfully"),
        "404": notFound("Team not found"),
      },
    }),
  },
  ...simpleCrud("tournaments", "Tournaments"),
  ...simpleCrud("markets", "Markets"),
};
