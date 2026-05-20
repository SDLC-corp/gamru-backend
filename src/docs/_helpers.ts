/**
 * Tiny OpenAPI builder helpers used by per-module `*.docs.ts` files.
 *
 * Why: keeps swagger definitions out of route files. Joi validations stay
 * the single source of truth at runtime; these helpers are only for the
 * spec served at /api/docs.
 */

export type AnySchema = Record<string, unknown>;
export type Operation = Record<string, unknown>;
export type PathItem = Record<string, Operation>;
export type PathsObject = Record<string, PathItem>;

export const bearer = (): Array<Record<string, string[]>> => [{ bearerAuth: [] }];

export const pathParam = (
  name: string,
  schema: AnySchema = { type: "string", format: "uuid" },
  description?: string
): AnySchema => ({
  in: "path",
  name,
  required: true,
  schema,
  ...(description ? { description } : {}),
});

export const queryParam = (
  name: string,
  schema: AnySchema,
  description?: string
): AnySchema => ({
  in: "query",
  name,
  schema,
  ...(description ? { description } : {}),
});

export const jsonBody = (schema: AnySchema, required = true): AnySchema => ({
  required,
  content: { "application/json": { schema } },
});

export const formBody = (schema: AnySchema, required = true): AnySchema => ({
  required,
  content: { "multipart/form-data": { schema } },
});

export const obj = (
  properties: Record<string, AnySchema>,
  required: string[] = []
): AnySchema => ({
  type: "object",
  ...(required.length ? { required } : {}),
  properties,
});

export const ok = (description = "Success"): AnySchema => ({ description });
export const created = (description = "Created"): AnySchema => ({ description });
export const notFound = (description = "Not found"): AnySchema => ({ description });
export const badRequest = (description = "Bad request"): AnySchema => ({ description });
export const unauthorized = (
  description = "Unauthorized"
): AnySchema => ({ description });
export const conflict = (description = "Conflict"): AnySchema => ({ description });
export const validationFailed = (
  description = "Validation failed"
): AnySchema => ({ description });

/**
 * Build a single operation object. Spreads `extra` last so callers can
 * override anything (e.g. add a `description` paragraph).
 */
export const op = (cfg: {
  tags: string[];
  summary: string;
  description?: string;
  security?: Array<Record<string, string[]>>;
  parameters?: AnySchema[];
  requestBody?: AnySchema;
  responses: Record<string, AnySchema>;
}): Operation => {
  const { tags, summary, description, security, parameters, requestBody, responses } = cfg;
  return {
    tags,
    summary,
    ...(description ? { description } : {}),
    ...(security ? { security } : {}),
    ...(parameters ? { parameters } : {}),
    ...(requestBody ? { requestBody } : {}),
    responses,
  };
};
