import { Request, Response, NextFunction } from "express";
import { applyEvent, SyncEvent } from "../service/integration.service";
import { successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { getRequestClient } from "../../../middlewares/clientAuth.middleware";

/**
 * POST /api/integration/events
 * Receives a gamification sync event (XP_AWARDED, USER_REGISTERED, …)
 * pushed by a registered consuming platform and applies it to the linked
 * Player. The authenticated `req.client` is forwarded so every row written
 * downstream (external_accounts, gam_xp_transactions, player_logs, etc.)
 * is attributed to that client.
 */
export const receiveEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const client = getRequestClient(req);
    const result = await applyEvent(req.body as SyncEvent, client);
    successResponse(res, 200, "Event processed", result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    console.error("Integration event failed:", error);
    next(new AppError("Failed to process integration event", 500));
  }
};
