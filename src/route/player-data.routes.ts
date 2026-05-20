import { Router } from "express";
import {
  createPlayerData,
  bulkCreatePlayerData,
  paginatePlayerData,
  updatePlayerData,
  deletePlayerData,
} from "../modules/player-data/controller/player-data.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPlayerDataSchema,
  bulkCreatePlayerDataSchema,
  updatePlayerDataSchema,
  playerDataIdParamSchema,
} from "../validations/player-data.validation";

const router = Router();

router.post("/add", auth, validate(createPlayerDataSchema), createPlayerData);

router.post(
  "/bulk",
  auth,
  validate(bulkCreatePlayerDataSchema),
  bulkCreatePlayerData
);

router.get("/paginate", auth, paginatePlayerData);

router.post(
  "/update-by/:id",
  auth,
  validate(playerDataIdParamSchema, "params"),
  validate(updatePlayerDataSchema, "body"),
  updatePlayerData
);

router.delete(
  "/:id",
  auth,
  validate(playerDataIdParamSchema, "params"),
  deletePlayerData
);

export default router;
