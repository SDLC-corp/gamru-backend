import {
  bearer,
  ok,
  pathParam,
  queryParam,
  notFound,
  op,
  PathsObject,
} from "./_helpers";
import {
  GAMIFICATION_FEATURES,
  GamificationFeatureKey,
} from "../modules/gamification/shared/gamification.model";

const TAG = "Gamification";

export const gamificationTag = {
  name: TAG,
  description: "Gamification feature APIs (missions, ranks, rules, …)",
};

const LABELS: Record<GamificationFeatureKey, string> = {
  missions: "Mission",
  "mission-bundles": "Mission Bundle",
  ranks: "Rank",
  "token-rules-casino": "Token Rule (Casino)",
  "token-rules-sports": "Token Rule (Sports)",
  "xp-point-rules-casino": "XP Point Rule (Casino)",
  "xp-point-rules-sports": "XP Point Rule (Sports)",
  "player-categories": "Player Category",
  "reward-shop": "Reward Shop Item",
  "prizeshark-catalog": "Prizeshark Catalog Item",
  "purchase-feed": "Purchase Feed Entry",
  tournaments: "Tournament",
};

const idParam = pathParam("id");

const featurePaths = (key: GamificationFeatureKey, label: string): PathsObject => ({
  [`/api/gamification/${key}/paginate`]: {
    get: op({
      tags: [TAG],
      summary: `Paginated ${label} list`,
      security: bearer(),
      parameters: [
        queryParam("page", { type: "integer", example: 1 }),
        queryParam("limit", { type: "integer", example: 25 }),
        queryParam("search", { type: "string" }),
        queryParam("status", { type: "string", enum: ["ACTIVE", "INACTIVE"] }),
        queryParam("archived", { type: "boolean" }),
        queryParam("tag", { type: "string" }),
      ],
      responses: { "200": ok(`${label} fetched successfully`) },
    }),
  },
  [`/api/gamification/${key}/{id}`]: {
    get: op({
      tags: [TAG],
      summary: `Get a single ${label} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} fetched successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
    delete: op({
      tags: [TAG],
      summary: `Delete ${label} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} deleted successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
  },
  [`/api/gamification/${key}/add`]: {
    post: op({
      tags: [TAG],
      summary: `Create a new ${label}`,
      security: bearer(),
      responses: { "200": ok(`${label} created successfully`) },
    }),
  },
  [`/api/gamification/${key}/update-by/{id}`]: {
    post: op({
      tags: [TAG],
      summary: `Update ${label} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} updated successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
  },
  [`/api/gamification/${key}/archive-by/{id}`]: {
    post: op({
      tags: [TAG],
      summary: `Archive ${label} by ID`,
      security: bearer(),
      parameters: [idParam],
      responses: {
        "200": ok(`${label} archived successfully`),
        "404": notFound(`${label} not found`),
      },
    }),
  },
});

export const gamificationPaths: PathsObject = (
  Object.keys(GAMIFICATION_FEATURES) as GamificationFeatureKey[]
).reduce<PathsObject>((acc, key) => Object.assign(acc, featurePaths(key, LABELS[key])), {});
