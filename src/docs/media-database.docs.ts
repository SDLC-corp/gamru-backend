import {
  bearer,
  formBody,
  obj,
  ok,
  pathParam,
  queryParam,
  notFound,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "MediaDatabase";

const CATEGORIES = [
  "banners",
  "booster-images",
  "email-templates-assets",
  "joy-saha",
  "mission-bundles",
  "mission-banner",
  "template",
];

export const mediaDatabaseTag = {
  name: TAG,
  description: "Media database (image asset) management APIs",
};

export const mediaDatabasePaths: PathsObject = {
  "/api/media-database/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated media assets (search + category filter)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 25 }),
        queryParam("search", { type: "string" }),
        queryParam("category", {
          type: "string",
          enum: ["all", ...CATEGORIES],
        }),
      ],
      responses: { "200": ok("Paginated media list") },
    }),
  },
  "/api/media-database/add": {
    post: op({
      tags: [TAG],
      summary: "Upload a new media asset",
      security: bearer(),
      requestBody: formBody(
        obj(
          {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string", enum: CATEGORIES },
            image: { type: "string", format: "binary" },
          },
          ["name", "category", "image"]
        )
      ),
      responses: { "201": ok("File uploaded successfully") },
    }),
  },
  "/api/media-database/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete a media asset by ID",
      security: bearer(),
      parameters: [pathParam("id")],
      responses: {
        "200": ok("Media deleted successfully"),
        "404": notFound("Media not found"),
      },
    }),
  },
};
