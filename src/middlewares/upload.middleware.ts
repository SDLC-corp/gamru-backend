import fs from "fs";
import path from "path";
import multer from "multer";
import { Request, Response, NextFunction } from "express";

// All uploaded media is stored under <project root>/uploads
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext.toLowerCase()}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single("image");

/**
 * Wraps the multer single-file middleware so upload errors (wrong type,
 * file too large) return a clean 422 instead of a generic 500.
 */
export const uploadImageSafe = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploadImage(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(422).json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 10 MB or smaller"
            : err.message,
      });
      return;
    }
    if (err instanceof Error) {
      res.status(422).json({ success: false, message: err.message });
      return;
    }
    next();
  });
};
