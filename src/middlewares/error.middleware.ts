import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  // Custom error (you throw manually)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Sequelize / DB error example (optional)
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Duplicate value",
      errors: {
        [err.errors[0].path]: err.errors[0].message,
      },
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: null,
  });
};