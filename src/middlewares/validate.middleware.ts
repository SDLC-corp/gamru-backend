import { Request, Response, NextFunction, RequestHandler } from "express";
import { ObjectSchema } from "joi";

type ValidateProperty = "body" | "query" | "params";

interface AnnotatedValidator extends RequestHandler {
  __joiBody?: ObjectSchema;
  __joiQuery?: ObjectSchema;
  __joiParams?: ObjectSchema;
}

export const validate = (
  schema: ObjectSchema,
  property: ValidateProperty = "body"
): AnnotatedValidator => {
  const handler: AnnotatedValidator = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
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

  if (property === "body") handler.__joiBody = schema;
  else if (property === "query") handler.__joiQuery = schema;
  else if (property === "params") handler.__joiParams = schema;

  return handler;
};
