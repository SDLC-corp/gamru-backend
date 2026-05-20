import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/request.type";
import {
  addRoleService,
  getRolesService,
  paginateRolesService,
  deleteRoleService,
  updateRoleService,
} from "../service/role.service";
import { errorResponse, successResponse } from "../../../utils/responseHandler";
import { AppError } from "../../../utils/AppError";
import { UniqueConstraintError } from "sequelize";

export const addRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const data = await addRoleService(name, description);
    console.log("Role created:", data);
    successResponse(res, 200, "Role created successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Role already exists");
    }

    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }

    return errorResponse(res, 500, "Failed to create role");
  }
};

export const getRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getRolesService();
    successResponse(res, 200, "Roles fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to fetch roles");
    }
  }
};

export const paginateRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const data = await paginateRolesService(page, limit);
    successResponse(res, 200, "Roles fetched successfully", data);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to fetch roles");
    }
  }
};

export const deleteRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await deleteRoleService(id);
    successResponse(res, 200, "Role deleted successfully", null);
  } catch (error) {
    if (error instanceof AppError) {
      errorResponse(res, error.statusCode, error.message);
    } else {
      errorResponse(res, 500, "Failed to delete role");
    }
  }
};

export const updateRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await updateRoleService(id, req.body);
    successResponse(res, 200, "Role updated successfully", data);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return errorResponse(res, 400, "Role already exists");
    }

    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }

    return errorResponse(res, 500, "Failed to update role");
  }
};