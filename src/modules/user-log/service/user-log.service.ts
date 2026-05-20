import UserLogRepository from "../model/user-log.repository";
import UserRepository from "../../user/model/user.repository";
import { AppError } from "../../../utils/AppError";

export const addLogService = async (data: any) => {
  const user = await UserRepository.findByPk(data.user_id);

  if (!user) {
    throw new AppError("User not found. Cannot create log.", 404);
  }

  return UserLogRepository.createLog(data);
};

export const getLogsService = async () => {
  return UserLogRepository.findAll();
};


export const getLogByIdService = async (id: string) => {
  const log = await UserLogRepository.findByPk(id);

  if (!log) throw new AppError("Log not found", 404);

  return log;
};


export const paginateLogsService = async (
  filters: any,
  page: number,
  limit: number
) => {
  return UserLogRepository.filterLogs(filters, page, limit);
};


export const updateLogService = async (id: string, data: any) => {
  const log = await UserLogRepository.findByPk(id);

  if (!log) throw new AppError("Log not found", 404);

  return UserLogRepository.updateByPk(id, data);
};


export const deleteLogService = async (id: string) => {
  const log = await UserLogRepository.findByPk(id);

  if (!log) throw new AppError("Log not found", 404);

  await UserLogRepository.deleteByPk(id);
  return true;
};