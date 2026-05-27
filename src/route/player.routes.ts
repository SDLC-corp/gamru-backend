import { Router } from "express";
import {
  paginatePlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getCampaignHistory,
  getRewards,
  addManualReward,
  claimReward,
  getLogs,
  getPlayerByEmail,
  addPlayerXpByEmail,
} from "../modules/player/controller/player.controller";
import { auth } from "../middlewares/auth.middleware";
import { clientAuth } from "../middlewares/clientAuth.middleware";
import { flexAuth } from "../middlewares/flexAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPlayerSchema,
  updatePlayerSchema,
  playerIdParamSchema,
  manualRewardSchema,
  addXpByEmailSchema,
} from "../validations/player.validation";

const router = Router();

router.get("/paginate", auth, paginatePlayers);

router.post("/add", auth, validate(createPlayerSchema), createPlayer);

// GET /:id is hit by BOTH the gamru admin UI (logged-in operator with
// JWT) and external service backends (x-client-auth-key). `flexAuth`
// accepts either credential and routes to the matching guard.
router.get(
  "/:id",
  flexAuth,
  validate(playerIdParamSchema, "params"),
  getPlayer
);

// The two `by-email` endpoints are only called by external service
// backends — they look players up by the consumer's external email,
// which an admin UI would never do. So they stay locked down to
// `x-client-auth-key` only.
router.post("/by-email", clientAuth, getPlayerByEmail);

router.post(
  "/by-email/add-xp",
  clientAuth,
  validate(addXpByEmailSchema, "body"),
  addPlayerXpByEmail
);

router.post(
  "/update-by/:id",
  auth,
  validate(playerIdParamSchema, "params"),
  validate(updatePlayerSchema, "body"),
  updatePlayer
);

router.delete(
  "/:id",
  auth,
  validate(playerIdParamSchema, "params"),
  deletePlayer
);

router.get(
  "/:id/campaign-history",
  auth,
  validate(playerIdParamSchema, "params"),
  getCampaignHistory
);

router.get(
  "/:id/rewards",
  auth,
  validate(playerIdParamSchema, "params"),
  getRewards
);
router.post(
  "/:id/rewards",
  auth,
  validate(playerIdParamSchema, "params"),
  validate(manualRewardSchema, "body"),
  addManualReward
);

// End-user "Claim" action is initiated by a service backend
// (e.g. game-platform → gamru), so the route is gated by clientAuth.
router.post(
  "/:id/rewards/:rewardId/claim",
  clientAuth,
  claimReward
);

router.get("/:id/logs", auth, validate(playerIdParamSchema, "params"), getLogs);

export default router;
