import { Router } from "express";
import {
  paginateClients,
  getClient,
  createClient,
  updateClient,
  suspendClient,
  restoreClient,
  deleteClient,
  rotateClientSecret,
  getClientUsage,
  listClientEvents,
  listClientPlayers,
} from "../modules/client/controller/client.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createClientSchema,
  updateClientSchema,
  clientIdParamSchema,
} from "../validations/client.validation";

const router = Router();
const admin = [auth, role("ADMIN")];

router.get("/paginate", ...admin, paginateClients);

router.post("/add", ...admin, validate(createClientSchema), createClient);

router.get(
  "/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  getClient
);

router.post(
  "/update-by/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  validate(updateClientSchema, "body"),
  updateClient
);

router.post(
  "/suspend/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  suspendClient
);

router.post(
  "/restore/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  restoreClient
);

router.post(
  "/rotate-secret/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  rotateClientSecret
);

router.delete(
  "/:id",
  ...admin,
  validate(clientIdParamSchema, "params"),
  deleteClient
);

router.get(
  "/:id/usage",
  ...admin,
  validate(clientIdParamSchema, "params"),
  getClientUsage
);

router.get(
  "/:id/events",
  ...admin,
  validate(clientIdParamSchema, "params"),
  listClientEvents
);

router.get(
  "/:id/players",
  ...admin,
  validate(clientIdParamSchema, "params"),
  listClientPlayers
);

export default router;
