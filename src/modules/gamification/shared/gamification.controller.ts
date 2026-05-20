import { Router, Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import { auth } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { GamificationEntity } from "./gamification.model";
import { GamificationService } from "./gamification.service";
import { assertValidRankPayload } from "./rank.guard";
import {
  paginateGamificationSchema,
  upsertGamificationSchema,
  archiveGamificationSchema,
  gamificationIdParamSchema,
} from "../../../validations/gamification.validation";

const fail = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

/**
 * Builds a fully-wired CRUD router for one gamification feature.
 * Endpoints mirror the rest of the codebase:
 *   GET    /paginate
 *   GET    /:id
 *   POST   /add
 *   POST   /update-by/:id
 *   POST   /archive-by/:id
 *   DELETE /:id
 */
interface GamificationRouterOptions {
  /** Enforce the single-ladder rank rules (continuity + uniqueness). */
  validateRankContinuity?: boolean;
}

export const buildGamificationRouter = (
  model: typeof GamificationEntity,
  label: string,
  options: GamificationRouterOptions = {}
): Router => {
  const router = Router();
  const service = new GamificationService(model, label);

  router.get(
    "/paginate",
    auth,
    validate(paginateGamificationSchema, "query"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 25);
        const data = await service.paginate(page, limit, {
          search: (req.query.search as string) || undefined,
          status: (req.query.status as "ACTIVE" | "INACTIVE") || undefined,
          archived: req.query.archived === "true",
          tag: (req.query.tag as string) || undefined,
        });
        successResponse(res, 200, `${label} fetched successfully`, data);
      } catch (error) {
        fail(res, error, `Failed to fetch ${label}`);
      }
    }
  );

  router.get(
    "/:id",
    auth,
    validate(gamificationIdParamSchema, "params"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        const record = await service.get(req.params.id);
        if (!record) throw new AppError(`${label} not found`, 404);
        successResponse(res, 200, `${label} fetched successfully`, record);
      } catch (error) {
        fail(res, error, `Failed to fetch ${label}`);
      }
    }
  );

  router.post(
    "/add",
    auth,
    validate(upsertGamificationSchema, "body"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        if (options.validateRankContinuity) {
          await assertValidRankPayload(req.body);
        }
        const record = await service.create({
          ...req.body,
          created_by: req.user?.email ?? null,
        });
        successResponse(res, 201, `${label} created successfully`, record);
      } catch (error) {
        fail(res, error, `Failed to create ${label}`);
      }
    }
  );

  router.post(
    "/update-by/:id",
    auth,
    validate(gamificationIdParamSchema, "params"),
    validate(upsertGamificationSchema, "body"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        if (options.validateRankContinuity) {
          await assertValidRankPayload(req.body, req.params.id);
        }
        const record = await service.update(req.params.id, req.body);
        successResponse(res, 200, `${label} updated successfully`, record);
      } catch (error) {
        fail(res, error, `Failed to update ${label}`);
      }
    }
  );

  router.post(
    "/archive-by/:id",
    auth,
    validate(gamificationIdParamSchema, "params"),
    validate(archiveGamificationSchema, "body"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        const record = await service.setArchived(
          req.params.id,
          Boolean(req.body.archived)
        );
        successResponse(res, 200, `${label} updated successfully`, record);
      } catch (error) {
        fail(res, error, `Failed to archive ${label}`);
      }
    }
  );

  router.delete(
    "/:id",
    auth,
    validate(gamificationIdParamSchema, "params"),
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      try {
        await service.remove(req.params.id);
        successResponse(res, 200, `${label} deleted successfully`, null);
      } catch (error) {
        fail(res, error, `Failed to delete ${label}`);
      }
    }
  );

  return router;
};
