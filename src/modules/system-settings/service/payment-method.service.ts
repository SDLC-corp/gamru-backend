import sequelize from "../../../config/db";
import PaymentMethodRepository from "../model/payment-method.repository";
import { AppError } from "../../../utils/AppError";

export interface PaymentMethodInput {
  unique_key: string;
  display_name: string;
}

export const listPaymentMethodsService = async () => {
  return PaymentMethodRepository.findAllOrdered();
};

export const getPaymentMethodService = async (id: string) => {
  const row = await PaymentMethodRepository.findByPk(id);
  if (!row) throw new AppError("Payment method not found", 404);
  return row;
};

export const createPaymentMethodService = async (data: PaymentMethodInput) => {
  return PaymentMethodRepository.create(data);
};

export const updatePaymentMethodService = async (
  id: string,
  data: Partial<PaymentMethodInput>
) => {
  const updated = await PaymentMethodRepository.updateByPk(id, data);
  if (!updated) throw new AppError("Payment method not found", 404);
  return updated;
};

export const deletePaymentMethodService = async (id: string) => {
  const ok = await PaymentMethodRepository.deleteByPk(id);
  if (!ok) throw new AppError("Payment method not found", 404);
  return null;
};

export const replacePaymentMethodsService = async (items: PaymentMethodInput[]) => {
  return sequelize.transaction(async (t) => {
    await PaymentMethodRepository.deleteWhere({}, { transaction: t });
    if (items.length === 0) return [];
    return PaymentMethodRepository.bulkCreate(items, { transaction: t });
  });
};
