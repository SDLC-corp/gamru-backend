import sequelize from "../../../config/db";
import AccountStatusRepository from "../model/account-status.repository";
import { AppError } from "../../../utils/AppError";

export interface AccountStatusInput {
  unique_key: string;
  display_name: string;
  icon?: string | null;
  color?: string | null;
}

export const listAccountStatusesService = async () => {
  return AccountStatusRepository.findAllOrdered();
};

export const getAccountStatusService = async (id: string) => {
  const row = await AccountStatusRepository.findByPk(id);
  if (!row) throw new AppError("Account status not found", 404);
  return row;
};

export const createAccountStatusService = async (data: AccountStatusInput) => {
  return AccountStatusRepository.create(data);
};

export const updateAccountStatusService = async (
  id: string,
  data: Partial<AccountStatusInput>
) => {
  const updated = await AccountStatusRepository.updateByPk(id, data);
  if (!updated) throw new AppError("Account status not found", 404);
  return updated;
};

export const deleteAccountStatusService = async (id: string) => {
  const ok = await AccountStatusRepository.deleteByPk(id);
  if (!ok) throw new AppError("Account status not found", 404);
  return null;
};

export const replaceAccountStatusesService = async (items: AccountStatusInput[]) => {
  return sequelize.transaction(async (t) => {
    await AccountStatusRepository.deleteWhere({}, { transaction: t });
    if (items.length === 0) return [];
    return AccountStatusRepository.bulkCreate(items, { transaction: t });
  });
};
