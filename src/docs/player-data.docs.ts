import {
  bearer,
  jsonBody,
  obj,
  ok,
  pathParam,
  queryParam,
  op,
  PathsObject,
} from "./_helpers";

const TAG = "PlayerData";

export const playerDataTag = {
  name: TAG,
  description: "CRM Player Data & Custom Data APIs",
};

const idParam = pathParam("id");

export const playerDataPaths: PathsObject = {
  "/api/player-data/add": {
    post: op({
      tags: [TAG],
      summary: "Create a custom data field",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            name: { type: "string" },
            description: { type: "string" },
            data_type: { type: "string", enum: ["STRING", "BOOLEAN", "NUMBER", "DATE"] },
            data_option: { type: "string" },
          },
          ["name", "data_type"]
        )
      ),
      responses: { "200": ok("Custom data created successfully") },
    }),
  },
  "/api/player-data/bulk": {
    post: op({
      tags: [TAG],
      summary: "Bulk import custom data fields (CSV upload)",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            rows: {
              type: "array",
              items: obj({
                name: { type: "string" },
                description: { type: "string" },
                data_type: { type: "string" },
              }),
            },
          },
          ["rows"]
        )
      ),
      responses: { "200": ok("Custom data imported successfully") },
    }),
  },
  "/api/player-data/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated player data (filter is_custom for Custom vs system fields)",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer" }),
        queryParam("limit", { type: "integer" }),
        queryParam("search", { type: "string" }),
        queryParam("data_type", { type: "string" }),
        queryParam("is_custom", { type: "boolean" }),
      ],
      responses: { "200": ok("Player data fetched successfully") },
    }),
  },
  "/api/player-data/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update a custom data field",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Custom data updated successfully") },
    }),
  },
  "/api/player-data/{id}": {
    delete: op({
      tags: [TAG],
      summary: "Delete a custom data field",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Custom data deleted successfully") },
    }),
  },
};
