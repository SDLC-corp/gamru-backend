import { Request, Response, NextFunction, RequestHandler } from "express";

interface AnnotatedServiceAuth extends RequestHandler {
  __requiresServiceKey?: true;
}

/**
 * Guards service-to-service endpoints (gamify-engage → gamru). Both
 * backends share `SERVICE_SHARED_KEY`; callers send it as `x-service-key`.
 */
export const serviceAuth: AnnotatedServiceAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expected = process.env.SERVICE_SHARED_KEY;
  const provided = req.header("x-service-key");

  if (!expected) {
    res
      .status(500)
      .json({ success: false, message: "SERVICE_SHARED_KEY not configured" });
    return;
  }
  if (!provided || provided !== expected) {
    res.status(401).json({ success: false, message: "Unauthorized service" });
    return;
  }
  next();
};

serviceAuth.__requiresServiceKey = true;
