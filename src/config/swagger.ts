/**
 * Re-exports the OpenAPI spec built in `src/docs/swagger.js`.
 *
 * The spec is auto-derived: each Express router is walked, and the metadata
 * attached by the validate / role / auth / serviceAuth / upload middlewares
 * is read back to produce the OpenAPI document. See `src/docs/swagger.js`
 * for the introspection logic and the ROUTE_GROUPS list.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { swaggerSpec: spec } = require("../docs/swagger");

export const swaggerSpec: Record<string, unknown> = spec;
