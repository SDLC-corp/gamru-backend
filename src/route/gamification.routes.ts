import { Router } from "express";
import {
  gamificationModels,
  GAMIFICATION_FEATURES,
  GamificationFeatureKey,
} from "../modules/gamification/shared/gamification.model";
import { buildGamificationRouter } from "../modules/gamification/shared/gamification.controller";

const router = Router();

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

(Object.keys(GAMIFICATION_FEATURES) as GamificationFeatureKey[]).forEach(
  (key) => {
    router.use(
      `/${key}`,
      buildGamificationRouter(gamificationModels[key], LABELS[key], {
        validateRankContinuity: key === "ranks",
      })
    );
  }
);

export default router;
