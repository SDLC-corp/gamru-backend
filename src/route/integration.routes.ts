import { Router } from "express";
import { receiveEvent } from "../modules/integration/controller/integration.controller";
import { clientAuth } from "../middlewares/clientAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { syncEventSchema } from "../validations/integration.validation";

const router = Router();

router.post(
  "/events",
  clientAuth("events.write"),
  validate(syncEventSchema, "body"),
  receiveEvent
);

export default router;
