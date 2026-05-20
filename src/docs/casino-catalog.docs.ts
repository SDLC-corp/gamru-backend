import {
  bearer,
  ok,
  pathParam,
  queryParam,
  notFound,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "CasinoCatalog";

export const casinoCatalogTag = {
  name: TAG,
  description: "Casino catalog (games, categories, providers) APIs",
};

const idParam = pathParam("id", { type: "string" });

const paginateParams = (extra: ReturnType<typeof queryParam>[] = []) => [
  queryParam("page", { type: "integer", example: 1 }),
  queryParam("limit", { type: "integer", example: 10 }),
  queryParam("search", { type: "string" }),
  ...extra,
];

const simpleCrud = (base: string, label: string): PathsObject => ({
  [`/api/casino-catalog/${base}/paginate`]: {
    get: op({
      tags: [TAG],
      summary: `Get paginated ${label} (search)`,
      security: bearer(),
      parameters: paginateParams(),
      responses: { "200": ok(`Paginated ${label}`) },
    }),
  },
  [`/api/casino-catalog/${base}/add`]: {
    post: op({
      tags: [TAG],
      summary: `Create a new ${label.replace(/s$/, "")}`,
      security: bearer(),
      responses: { "201": ok(`${label} created successfully`) },
    }),
  },
  [`/api/casino-catalog/${base}/update-by/{id}`]: {
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
  [`/api/casino-catalog/${base}/{id}`]: {
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

export const casinoCatalogPaths: PathsObject = {
  // Games has extra provider/category filters
  "/api/casino-catalog/games/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated casino games (search + provider/category filters)",
      security: bearer(),
      parameters: paginateParams([
        queryParam("provider", { type: "string" }),
        queryParam("category", { type: "string" }),
      ]),
      responses: { "200": ok("Paginated casino games") },
    }),
  },
  "/api/casino-catalog/games/add": {
    post: op({
      tags: [TAG],
      summary: "Create a new casino game",
      security: bearer(),
      responses: { "201": ok("Casino game created successfully") },
    }),
  },
  "/api/casino-catalog/games/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update casino game by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Casino game updated successfully"),
        "404": notFound("Casino game not found"),
      },
    }),
  },
  "/api/casino-catalog/games/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete casino game by ID",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Casino game deleted successfully"),
        "404": notFound("Casino game not found"),
      },
    }),
  },
  ...simpleCrud("categories", "Casino categories"),
  ...simpleCrud("providers", "Casino providers"),
};
