import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import {
  createClientService,
  deleteClientService,
  getClientService,
  listClientsService,
  rotateAuthKeyService,
  toggleClientStatusService,
  updateClientService,
} from "../service/client.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { ClientStatus } from "../model/client.model";

const handle = (
  res: Response,
  err: unknown,
  fallback: string,
  conflictMsg = "Client already exists"
): void => {
  if (err instanceof UniqueConstraintError) {
    errorResponse(res, 409, conflictMsg);
    return;
  }
  if (err instanceof AppError) {
    errorResponse(res, err.statusCode, err.message);
    return;
  }
  errorResponse(res, 500, fallback);
};

export const createClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createClientService(req.body);
    successResponse(res, 201, "Client created successfully", data);
  } catch (err) {
    handle(res, err, "Failed to create client");
  }
};

export const listClients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const status =
      req.query.status === "ENABLED" || req.query.status === "DISABLED"
        ? (req.query.status as ClientStatus)
        : undefined;

    const data = await listClientsService({ page, limit, search, status });
    successResponse(res, 200, "Clients fetched successfully", data);
  } catch (err) {
    handle(res, err, "Failed to fetch clients");
  }
};

export const getClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getClientService(req.params.id);
    successResponse(res, 200, "Client fetched successfully", data);
  } catch (err) {
    handle(res, err, "Failed to fetch client");
  }
};

export const updateClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await updateClientService(req.params.id, req.body);
    successResponse(res, 200, "Client updated successfully", data);
  } catch (err) {
    handle(res, err, "Failed to update client");
  }
};

export const rotateClientAuthKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await rotateAuthKeyService(req.params.id);
    successResponse(res, 200, "Auth key rotated", data);
  } catch (err) {
    handle(res, err, "Failed to rotate auth key");
  }
};

export const toggleClientStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await toggleClientStatusService(req.params.id);
    successResponse(res, 200, "Client status updated", data);
  } catch (err) {
    handle(res, err, "Failed to update client status");
  }
};

export const deleteClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteClientService(req.params.id);
    successResponse(res, 200, "Client deleted successfully", null);
  } catch (err) {
    handle(res, err, "Failed to delete client");
  }
};
