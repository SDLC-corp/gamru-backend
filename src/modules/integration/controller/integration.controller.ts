import { Request, Response, NextFunction } from "express";
import { applyEvent, SyncEvent } from "../service/integration.service";
import { successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

/**
 * POST /api/integration/events
 * Receives a gamification sync event (XP_AWARDED, USER_REGISTERED, …)
 * pushed by gamify-engage-backend and applies it to the linked Player.
 */
export const receiveEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await applyEvent(req.body as SyncEvent);
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
