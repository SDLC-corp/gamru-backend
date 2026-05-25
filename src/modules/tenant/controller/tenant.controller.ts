import { Response, NextFunction } from "express";
import { UniqueConstraintError } from "sequelize";
import { AuthRequest } from "../../../types/request.type";
import { AppError } from "../../../utils/AppError";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import {
  listTenantsService,
  getTenantService,
  createTenantService,
  updateTenantService,
  suspendTenantService,
  reactivateTenantService,
} from "../service/tenant.service";

const handle = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof UniqueConstraintError) {
    return errorResponse(res, 409, "Tenant slug or subdomain already in use");
  }
  if (error instanceof AppError) {
    return errorResponse(res, error.statusCode, error.message);
  }
  return errorResponse(res, 500, fallback);
};

export const listTenants = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const data = await listTenantsService(
      page,
      limit,
      req.query.search as string | undefined,
      req.query.status as
        | "ACTIVE"
        | "SUSPENDED"
        | "DELETED"
        | undefined
    );
    successResponse(res, 200, "Tenants fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch tenants");
  }
};

export const getTenant = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await getTenantService(req.params.id);
    successResponse(res, 200, "Tenant fetched successfully", data);
  } catch (error) {
    handle(res, error, "Failed to fetch tenant");
  }
};

export const createTenant = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await createTenantService(req.body);
    successResponse(res, 201, "Tenant created successfully", data);
  } catch (error) {
    handle(res, error, "Failed to create tenant");
  }
};

export const updateTenant = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await updateTenantService(req.params.id, req.body);
    successResponse(res, 200, "Tenant updated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to update tenant");
  }
};

export const suspendTenant = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await suspendTenantService(req.params.id);
    successResponse(res, 200, "Tenant suspended successfully", data);
  } catch (error) {
    handle(res, error, "Failed to suspend tenant");
  }
};

export const reactivateTenant = async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = await reactivateTenantService(req.params.id);
    successResponse(res, 200, "Tenant reactivated successfully", data);
  } catch (error) {
    handle(res, error, "Failed to reactivate tenant");
  }
};
