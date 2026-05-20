import fs from "fs";
import path from "path";
import MediaDatabaseRepository from "../model/media-database.repository";
import MediaDatabase, {
  MediaDatabaseCategory,
} from "../model/media-database.model";
import { UPLOAD_DIR } from "../../../middlewares/upload.middleware";
import { AppError } from "../../../utils/AppError";

export interface CreateMediaInput {
  name: string;
  description?: string | null;
  category: MediaDatabaseCategory;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_by?: string | null;
}

/** Map a DB row to the shape the frontend expects (camelCase + absolute URLs). */
export const toMediaDTO = (row: MediaDatabase, baseUrl: string) => {
  const url = `${baseUrl}/uploads/${row.file_path}`;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category,
    imageUrl: url,
    thumbnailUrl: url,
    fileSize: formatBytes(row.file_size),
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const formatBytes = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export const paginateMediaService = async (
  page: number,
  limit: number,
  filters: { search?: string; category?: MediaDatabaseCategory }
) => {
  return MediaDatabaseRepository.paginateMedia(page, limit, filters);
};

export const addMediaService = async (data: CreateMediaInput) => {
  return MediaDatabaseRepository.create({
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    file_path: data.file_path,
    file_size: data.file_size ?? null,
    mime_type: data.mime_type ?? null,
    created_by: data.created_by ?? null,
  });
};

export const deleteMediaService = async (id: string) => {
  const row = await MediaDatabaseRepository.findByPk(id);
  if (!row) {
    throw new AppError("Media not found", 404);
  }

  // Best-effort removal of the physical file.
  const filePath = path.join(UPLOAD_DIR, row.file_path);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore file-system errors, still remove the DB record */
    }
  }

  await MediaDatabaseRepository.deleteByPk(id);
  return null;
};
