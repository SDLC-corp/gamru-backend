import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate =
  (schema: ObjectSchema, property: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // important: get all errors
    });

    if (error) {
      const formattedErrors: Record<string, string> = {};

      error.details.forEach((err) => {
        const key = err.path[0] as string;
        formattedErrors[key] = err.message;
      });

      res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
      return;
    }

    req[property] = value;
    next();
  };