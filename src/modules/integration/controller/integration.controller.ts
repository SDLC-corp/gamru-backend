import { Response, NextFunction } from "express";
import { applyEvent, SyncEvent } from "../service/integration.service";
import { successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { ClientRequest } from "../../../types/request.type";

/**
 * POST /api/integration/events
 * Receives a gamification sync event (XP_AWARDED, USER_REGISTERED, …)
 * pushed by an external client backend and applies it to the linked
 * Player. `clientAuth` has already resolved `req.client` from the
 * `x-client-auth-key` header, so we know which client originated the
 * event and can tag it for audit.
 */
export const receiveEvent = async (
  req: ClientRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await applyEvent(req.body as SyncEvent, req.client);
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
