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
  getLogs,
  getPlayerByEmail,
  addPlayerXpByEmail,
} from "../modules/player/controller/player.controller";
import { auth } from "../middlewares/auth.middleware";
import { clientAuth } from "../middlewares/clientAuth.middleware";
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

// Endpoints below are called from external client backends (e.g. a
// games platform). They require `x-client-auth-key` matching a row in
// `clientConfig`. Missing/unknown key → 401, DISABLED client → 403.
router.get(
  "/:id",
  clientAuth,
  validate(playerIdParamSchema, "params"),
  getPlayer
);

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

router.get("/:id/logs", auth, validate(playerIdParamSchema, "params"), getLogs);

export default router;
