import { Router } from "express";
import {
  paginateCasinoGames,
  addCasinoGame,
  updateCasinoGame,
  deleteCasinoGame,
  paginateCasinoCategories,
  addCasinoCategory,
  updateCasinoCategory,
  deleteCasinoCategory,
  paginateCasinoProviders,
  addCasinoProvider,
  updateCasinoProvider,
  deleteCasinoProvider,
} from "../modules/casino-catalog/controller/casino-catalog.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  paginateCasinoGameSchema,
  addCasinoGameSchema,
  updateCasinoGameSchema,
  paginateCasinoSimpleSchema,
  addCasinoSimpleSchema,
  updateCasinoSimpleSchema,
  casinoIdParamSchema,
} from "../validations/casino-catalog.validation";

const router = Router();

// ─── Games ─────────────────────────────────────────────────────────
router.get(
  "/games/paginate",
  auth,
  validate(paginateCasinoGameSchema, "query"),
  paginateCasinoGames
);

router.post(
  "/games/add",
  auth,
  validate(addCasinoGameSchema, "body"),
  addCasinoGame
);

router.post(
  "/games/update-by/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  validate(updateCasinoGameSchema, "body"),
  updateCasinoGame
);

router.delete(
  "/games/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  deleteCasinoGame
);

// ─── Categories ────────────────────────────────────────────────────
router.get(
  "/categories/paginate",
  auth,
  validate(paginateCasinoSimpleSchema, "query"),
  paginateCasinoCategories
);

router.post(
  "/categories/add",
  auth,
  validate(addCasinoSimpleSchema, "body"),
  addCasinoCategory
);

router.post(
  "/categories/update-by/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  validate(updateCasinoSimpleSchema, "body"),
  updateCasinoCategory
);

router.delete(
  "/categories/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  deleteCasinoCategory
);

// ─── Providers ─────────────────────────────────────────────────────
router.get(
  "/providers/paginate",
  auth,
  validate(paginateCasinoSimpleSchema, "query"),
  paginateCasinoProviders
);

router.post(
  "/providers/add",
  auth,
  validate(addCasinoSimpleSchema, "body"),
  addCasinoProvider
);

router.post(
  "/providers/update-by/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  validate(updateCasinoSimpleSchema, "body"),
  updateCasinoProvider
);

router.delete(
  "/providers/:id",
  auth,
  validate(casinoIdParamSchema, "params"),
  deleteCasinoProvider
);

export default router;
