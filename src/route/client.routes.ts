import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  getCurrentClient,
  listClients,
  rotateClientAuthKey,
  toggleClientStatus,
  updateClient,
} from "../modules/client/controller/client.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { clientAuth } from "../middlewares/clientAuth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  clientIdParamSchema,
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from "../validations/client.validation";

const router = Router();

// Client-key authenticated identity lookup (no admin login required).
// Used by consuming backends to verify their auth key at boot.
router.get("/me", clientAuth, getCurrentClient);

router.post(
  "/add",
  auth,
  role("ADMIN"),
  validate(createClientSchema),
  createClient
);

router.get(
  "/paginate",
  auth,
  role("ADMIN"),
  validate(listClientsQuerySchema, "query"),
  listClients
);

router.get(
  "/:id",
  auth,
  role("ADMIN"),
  validate(clientIdParamSchema, "params"),
  getClient
);

router.post(
  "/update-by/:id",
  auth,
  role("ADMIN"),
  validate(clientIdParamSchema, "params"),
  validate(updateClientSchema, "body"),
  updateClient
);

router.post(
  "/rotate-auth-key/:id",
  auth,
  role("ADMIN"),
  validate(clientIdParamSchema, "params"),
  rotateClientAuthKey
);

router.post(
  "/toggle-status/:id",
  auth,
  role("ADMIN"),
  validate(clientIdParamSchema, "params"),
  toggleClientStatus
);

router.delete(
  "/:id",
  auth,
  role("ADMIN"),
  validate(clientIdParamSchema, "params"),
  deleteClient
);

export default router;
