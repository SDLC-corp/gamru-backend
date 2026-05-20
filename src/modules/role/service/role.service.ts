import RoleRepository from "../model/role.repository";
import { AppError } from "../../../utils/AppError";

export const addRoleService = async (
  name: string,
  description?: string
) => {
  const existing = await RoleRepository.findByName(name);
  if (existing) {
    throw new AppError("Role already exists", 409);
  }
  return RoleRepository.create({
    name: name.toUpperCase(),
    description,
  });
};

export const getRolesService = async () => {
  return RoleRepository.findAllRoles();
};

export const paginateRolesService = async (page: number, limit: number) => {
  return RoleRepository.paginateRoles(page, limit);
};

export const deleteRoleService = async (id: string) => {
  const role = await RoleRepository.findByPk(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  await RoleRepository.deleteByPk(id);
  return null;
};

export const updateRoleService = async (
  id: string,
  data: { name?: string; description?: string; status?: "ACTIVE" | "INACTIVE" }
) => {
  if (data.name) {
    data.name = data.name.toUpperCase();
  }
  const updated = await RoleRepository.updateByPk(id, data);

  if (!updated) {
    throw new AppError("Role not found", 404);
  }

  return updated;
};