import { Router } from "express";
import { receiveEvent } from "../modules/integration/controller/integration.controller";
import { serviceAuth } from "../middlewares/serviceAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { syncEventSchema } from "../validations/integration.validation";

const router = Router();

router.post(
  "/events",
  serviceAuth,
  validate(syncEventSchema, "body"),
  receiveEvent
);

export default router;
