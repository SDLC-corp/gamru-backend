import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  rotateClientAuthKey,
  toggleClientStatus,
  updateClient,
} from "../modules/client/controller/client.controller";
import { auth } from "../middlewares/auth.middleware";
import { role } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  clientIdParamSchema,
  createClientSchema,
  listClientsQuerySchema,
  updateClientSchema,
} from "../validations/client.validation";

const router = Router();

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
