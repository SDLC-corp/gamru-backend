import { ok, op, unauthorized, PathsObject } from "./_helpers";

const TAG = "Integration";

export const integrationTag = {
  name: TAG,
  description: "Service-to-service gamification sync (gamify-engage → gamru)",
};

export const integrationPaths: PathsObject = {
  "/api/integration/events": {
    post: op({
      tags: [TAG],
      summary: "Apply a gamification sync event to the linked player",
      description:
        "Service-authenticated (x-service-key). Idempotent on event_id. USER_REGISTERED links the gamify user to a gamru player; XP_AWARDED accumulates XP and recomputes level/rank from the configured rank ladder.",
      responses: {
        "200": ok("Event processed"),
        "401": unauthorized("Unauthorized service"),
      },
    }),
  },
};
