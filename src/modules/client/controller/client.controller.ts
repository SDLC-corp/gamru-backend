import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import {
  createClientService,
  paginateClientsService,
  getClientService,
  updateClientService,
  deleteClientService,
  setClientStatusService,
  rotateClientSecretService,
  getClientUsageService,
  listClientEventsService,
  listClientPlayersService,
} from "../service/client.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";

const handle = (res: Response, error: unknown, fallback: string): Response => {
  if (error instanceof UniqueConstraintError) {
    return errorResponse(res, 409, "A client with that identifier already exists");
  }
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

const pageLimit = (req: AuthRequest) => ({
  page: Number(req.query.page || 1),
  limit: Number(req.query.limit || 25),
});

export const paginateClients = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { page, limit } = pageLimit(req);
    const data = await paginateClientsService(page, limit, {
      search: req.query.search as string | undefined,
      status: req.query.status as
        | "ACTIVE"
        | "SUSPENDED"
        | "ARCHIVED"
        | undefined,
    });
    successResponse(res, 200, "Clients fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch clients");
  }
};

export const getClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getClientService(req.params.id);
    successResponse(res, 200, "Client fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch client");
  }
};

export const createClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { client, client_secret } = await createClientService(
      req.body,
      req.user?.id ?? null
    );
    successResponse(res, 201, "Client created — copy the secret now", {
      client,
      // The plaintext secret is returned ONCE; document this loudly in the
      // UI so the operator knows to save it before navigating away.
      client_secret,
    });
  } catch (error) {
    handle(res, error, "Failed to create client");
  }
};

export const updateClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateClientService(req.params.id, req.body);
    successResponse(res, 200, "Client updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update client");
  }
};

export const suspendClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await setClientStatusService(req.params.id, "SUSPENDED");
    successResponse(res, 200, "Client suspended", data);
  } catch (error) {
    handle(res, error, "Failed to suspend client");
  }
};

export const restoreClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await setClientStatusService(req.params.id, "ACTIVE");
    successResponse(res, 200, "Client restored", data);
  } catch (error) {
    handle(res, error, "Failed to restore client");
  }
};

export const deleteClient = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    await deleteClientService(req.params.id);
    successResponse(res, 200, "Client deleted", null);
  } catch (error) {
    handle(res, error, "Failed to delete client");
  }
};

export const rotateClientSecret = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { client, client_secret } = await rotateClientSecretService(
      req.params.id
    );
    successResponse(
      res,
      200,
      "Secret rotated — copy the new value now",
      { client, client_secret }
    );
  } catch (error) {
    handle(res, error, "Failed to rotate secret");
  }
};

export const getClientUsage = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getClientUsageService(req.params.id);
    successResponse(res, 200, "Client usage fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch client usage");
  }
};

export const listClientEvents = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { page, limit } = pageLimit(req);
    const data = await listClientEventsService(req.params.id, page, limit);
    successResponse(res, 200, "Client events fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch client events");
  }
};

export const listClientPlayers = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const { page, limit } = pageLimit(req);
    const data = await listClientPlayersService(req.params.id, page, limit);
    successResponse(res, 200, "Client players fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch client players");
  }
};
