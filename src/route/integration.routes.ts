import { Router } from "express";
import { receiveEvent } from "../modules/integration/controller/integration.controller";
import { serviceAuth } from "../middlewares/serviceAuth.middleware";
import { clientAuth } from "../middlewares/clientAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { syncEventSchema } from "../validations/integration.validation";

const router = Router();

// Primary cross-service auth: every event must carry an `x-client-auth-key`
// from a row in `clientConfig`. `serviceAuth` (the legacy shared key) stays
// in place as defence-in-depth so accidentally leaked client keys can't be
// used from outside our infra. Either side can be removed later if desired.
router.post(
  "/events",
  serviceAuth,
  clientAuth,
  validate(syncEventSchema, "body"),
  receiveEvent
);

export default router;
