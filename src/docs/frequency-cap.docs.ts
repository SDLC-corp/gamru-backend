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

const TAG = "FrequencyCaps";

export const frequencyCapTag = {
  name: TAG,
  description: "CRM Frequency Cap management APIs",
};

const idParam = pathParam("id");
const CHANNELS = ["EMAIL", "SMS", "ONSITE", "WEBPUSH", "INAPP"];
const PERIODS = ["PER_DAY", "PER_WEEK", "PER_MONTH"];

export const frequencyCapPaths: PathsObject = {
  "/api/frequency-caps/add": {
    post: op({
      tags: [TAG],
      summary: "Create a frequency cap",
      security: bearer(),
      requestBody: jsonBody(
        obj(
          {
            channel: { type: "string", enum: CHANNELS },
            period: { type: "string", enum: PERIODS },
            limit: { type: "integer", example: 3 },
          },
          ["channel", "period", "limit"]
        )
      ),
      responses: { "200": ok("Frequency cap created successfully") },
    }),
  },
  "/api/frequency-caps/paginate": {
    get: op({
      tags: [TAG],
      summary: "Get paginated frequency caps",
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer" }),
        queryParam("limit", { type: "integer" }),
        queryParam("search", { type: "string" }),
        queryParam("channel", { type: "string" }),
        queryParam("period", { type: "string" }),
      ],
      responses: { "200": ok("Paginated frequency caps list") },
    }),
  },
  "/api/frequency-caps/{id}": {
    get: op({
      tags: [TAG],
      summary: "Get a single frequency cap",
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok("Frequency cap fetched successfully"),
        "404": notFound("Frequency cap not found"),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: "Delete a frequency cap",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Frequency cap deleted successfully") },
    }),
  },
  "/api/frequency-caps/update-by/{id}": {
    post: op({
      tags: [TAG],
      summary: "Update a frequency cap",
      security: bearer(),
      parameters: [idParam],
      responses: { "200": ok("Frequency cap updated successfully") },
    }),
  },
};
