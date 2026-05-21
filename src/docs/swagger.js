/* eslint-disable @typescript-eslint/no-var-requires */
const j2s = require("joi-to-swagger");

// ──────────────────────────────────────────────────────────────────────────
// Auto-derived OpenAPI spec.
//
// We do NOT use swagger-jsdoc. Instead we walk each registered Express
// router, read metadata that the validate / auth / role / upload
// middlewares attach to themselves, and emit one path entry per route.
// Adding a new resource is one line in ROUTE_GROUPS — no JSDoc, no
// per-endpoint annotations required.
//
// Optional per-endpoint overrides (custom summary, response shape, etc.)
// live next to the router as:
//   router.docs = { 'GET /me': { summary: '...', responseSchema: {...} } };
// ──────────────────────────────────────────────────────────────────────────

const ROUTE_GROUPS = [
  { prefix: "/api/auth", tag: "Auth", router: require("../route/auth.routes").default },
  { prefix: "/api/users", tag: "Users", router: require("../route/user.routes").default },
  { prefix: "/api/user-log", tag: "User Logs", router: require("../route/user-log.routes").default },
  { prefix: "/api/roles", tag: "Roles", router: require("../route/role.routes").default },
  { prefix: "/api/system-settings", tag: "System Settings", router: require("../route/system-settings.routes").default },
  { prefix: "/api/tags-gamification", tag: "Gamification Tags", router: require("../route/gamification-tag.routes").default },
  { prefix: "/api/media-database", tag: "Media Database", router: require("../route/media-database.routes").default },
  { prefix: "/api/casino-catalog", tag: "Casino Catalog", router: require("../route/casino-catalog.routes").default },
  { prefix: "/api/sport-catalog", tag: "Sport Catalog", router: require("../route/sport-catalog.routes").default },
  { prefix: "/api/gamification", tag: "Gamification", router: require("../route/gamification.routes").default },
  { prefix: "/api/campaigns", tag: "Campaigns", router: require("../route/campaign.routes").default },
  { prefix: "/api/segments", tag: "Segments", router: require("../route/segment.routes").default },
  { prefix: "/api/templates", tag: "Templates", router: require("../route/template.routes").default },
  { prefix: "/api/custom-triggers", tag: "Custom Triggers", router: require("../route/custom-trigger.routes").default },
  { prefix: "/api/frequency-caps", tag: "Frequency Caps", router: require("../route/frequency-cap.routes").default },
  { prefix: "/api/unsubscribe-reports", tag: "Unsubscribe Reports", router: require("../route/unsubscribe-report.routes").default },
  { prefix: "/api/player-data", tag: "Player Data", router: require("../route/player-data.routes").default },
  { prefix: "/api/players", tag: "Players", router: require("../route/player.routes").default },
  { prefix: "/api/analytics", tag: "Analytics", router: require("../route/analytics.routes").default },
  { prefix: "/api/integration", tag: "Integration", router: require("../route/integration.routes").default },
];

// ── Path / parameter helpers ──────────────────────────────────────────────

function expressPathToOpenApi(p) {
  const converted = p.replace(/:(\w+)/g, "{$1}");
  return converted.length > 1 ? converted.replace(/\/$/, "") : converted;
}

function paramsFromJoi(joi, where) {
  const swagger = j2s(joi).swagger;
  const required = swagger.required || [];
  return Object.entries(swagger.properties || {}).map(([name, schema]) => ({
    in: where,
    name,
    required: where === "path" ? true : required.includes(name),
    schema,
  }));
}

function pathParametersFromPath(routePath) {
  return [...routePath.matchAll(/:(\w+)/g)].map(([, name]) => ({
    in: "path",
    name,
    required: true,
    schema:
      name === "id" || name.endsWith("Id")
        ? { type: "string", format: "uuid" }
        : { type: "string" },
  }));
}

// ── Router introspection ──────────────────────────────────────────────────

// Recover the mount path from an Express `use(path, subRouter)` layer's
// compiled regexp. Express stores no `.path` for `use()` registrations, so
// we read it back from `regexp.source` (shape: `^\/foo-bar\/?(?=\/|$)`).
function extractMountPath(layer) {
  if (!layer.regexp || layer.regexp.fast_slash) return "";
  const src = layer.regexp.source;
  const m = src.match(/^\^\\\/([\w-]+(?:\\\/[\w-]+)*)\\\/\?\(\?=\\\/\|\$\)$/);
  return m ? "/" + m[1].replace(/\\\//g, "/") : "";
}

// Recursively walks a router's middleware stack, yielding each registered
// route along with its full path (relative to the router's mount point).
function walkRouter(stack, prefix, out) {
  for (const layer of stack) {
    if (layer.route) {
      out.push({ path: prefix + layer.route.path, route: layer.route });
    } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      walkRouter(layer.handle.stack, prefix + extractMountPath(layer), out);
    }
  }
}

// Inspect a route's middleware stack and pull off the metadata attached
// by validate / role / auth / serviceAuth / upload.
function inspectRoute(route) {
  const meta = {
    joiBody: null,
    joiQuery: null,
    joiParams: null,
    requiredRoles: null,
    requiresAuth: false,
    requiresServiceKey: false,
    multipartField: null,
  };
  for (const layer of route.stack) {
    const fn = layer.handle;
    if (!fn) continue;
    if (fn.__joiBody) meta.joiBody = fn.__joiBody;
    if (fn.__joiQuery) meta.joiQuery = fn.__joiQuery;
    if (fn.__joiParams) meta.joiParams = fn.__joiParams;
    if (fn.__requiredRoles) meta.requiredRoles = fn.__requiredRoles;
    if (fn.__requiresAuth) meta.requiresAuth = true;
    if (fn.__requiresServiceKey) meta.requiresServiceKey = true;
    if (fn.__multipartField) meta.multipartField = fn.__multipartField;
  }
  return meta;
}

// ── Default summary generator ─────────────────────────────────────────────

const VERB_BY_METHOD = {
  get: "Get",
  post: "Create",
  put: "Update",
  patch: "Update",
  delete: "Delete",
};

const MODIFIERS = new Set([
  "add",
  "paginate",
  "update-by",
  "archive",
  "archive-by",
  "restore",
  "bulk",
  "me",
]);

function humanize(slug) {
  return slug.replace(/-/g, " ");
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function singularize(word) {
  return word
    .toLowerCase()
    .replace(/ies$/, "y")
    .replace(/ses$/, "s")
    .replace(/s$/, "");
}

function autoSummary(method, routePath, tag) {
  const segments = routePath.split("/").filter(Boolean);
  const literals = segments.filter((s) => !s.startsWith(":"));
  const hasIdParam = segments.some((s) => s.startsWith(":"));

  // The "subject" is the deepest literal that isn't a modifier verb —
  // for `/games/add` that's "games", for `/add` it's the tag.
  const nonModifier = literals.filter((s) => !MODIFIERS.has(s));
  const subjectSlug =
    nonModifier.length > 0 ? nonModifier[nonModifier.length - 1] : tag;
  const subjectHuman = humanize(subjectSlug).toLowerCase();
  const singular = singularize(subjectHuman);
  const pluralHuman = humanize(
    nonModifier.length > 0 ? nonModifier[nonModifier.length - 1] : tag
  );

  if (literals.length === 0) {
    if (method === "get" && hasIdParam) return `Get a ${singular}`;
    if (method === "delete" && hasIdParam) return `Delete a ${singular}`;
    if (method === "get") return `List ${pluralHuman}`;
    return `${VERB_BY_METHOD[method]} a ${singular}`;
  }

  const last = literals[literals.length - 1];
  const titledLast = titleCase(humanize(last));

  if (last === "add") return `Create a ${singular}`;
  if (last === "paginate") return `Paginate ${pluralHuman.toLowerCase()}`;
  if (last === "bulk") return `Bulk update ${pluralHuman.toLowerCase()}`;
  if (last === "update-by") return `Update a ${singular}`;
  if (last === "archive" || last === "archive-by") return `Archive a ${singular}`;
  if (last === "restore") return `Restore a ${singular}`;
  if (last === "me") return method === "get" ? "Get me" : "Update me";

  // last literal is a real entity / action segment (no modifier).
  if (hasIdParam) {
    // Routes like /:id (sub === tag) or /sub/:id or /:id/sub
    if (last === subjectSlug) {
      if (method === "get") return `Get a ${singular}`;
      if (method === "delete") return `Delete a ${singular}`;
      if (method === "post") return `Create a ${singular}`;
      return `${VERB_BY_METHOD[method]} a ${singular}`;
    }
    // last segment is an action verb that follows :id (e.g. /:id/approve)
    return `${titledLast} ${singularize(humanize(tag).toLowerCase())}`;
  }

  // No id param, last segment IS the action (e.g. POST /login, /by-email).
  if (method !== "get" && method !== "delete") {
    return titledLast;
  }

  return `${VERB_BY_METHOD[method]} ${humanize(last)}`;
}

// ── Operation builder ─────────────────────────────────────────────────────

function buildOperation({ method, routePath, tag, meta, override }) {
  const parameters = meta.joiParams
    ? paramsFromJoi(meta.joiParams, "path")
    : pathParametersFromPath(routePath);

  if (meta.joiQuery) parameters.push(...paramsFromJoi(meta.joiQuery, "query"));

  const summary =
    (override && override.summary) || autoSummary(method, routePath, tag);
  const summaryWithRole =
    !override?.summary && meta.requiredRoles
      ? `${summary} (${meta.requiredRoles.join("/")})`
      : summary;

  const op = {
    tags: [tag],
    summary: summaryWithRole,
    parameters,
    responses: {
      200: { description: "Success" },
      400: { description: "Bad request" },
      500: { description: "Server error" },
    },
  };

  if (override?.description) op.description = override.description;

  if (meta.requiresServiceKey) {
    op.security = [{ serviceKey: [] }];
  } else if (meta.requiresAuth) {
    op.security = [{ bearerAuth: [] }];
    op.responses[401] = { description: "Unauthorized" };
  }

  if (meta.requiredRoles) {
    op.responses[403] = { description: "Forbidden" };
  }

  if (parameters.some((p) => p.in === "path")) {
    op.responses[404] = { description: "Not found" };
  }

  if (meta.joiBody && ["post", "put", "patch"].includes(method)) {
    const schema = j2s(meta.joiBody).swagger;
    const contentType = meta.multipartField
      ? "multipart/form-data"
      : "application/json";
    op.requestBody = {
      required: true,
      content: { [contentType]: { schema } },
    };
    op.responses[422] = { description: "Validation failed" };
  } else if (meta.multipartField && ["post", "put", "patch"].includes(method)) {
    op.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              [meta.multipartField]: { type: "string", format: "binary" },
            },
            required: [meta.multipartField],
          },
        },
      },
    };
  }

  if (override?.responseSchema) {
    op.responses[200] = {
      description: override.responseDescription || "Success",
      content: {
        "application/json": { schema: override.responseSchema },
      },
    };
  }
  if (override?.responses) {
    Object.assign(op.responses, override.responses);
  }

  if (override?.deprecated) op.deprecated = true;

  return op;
}

// ── Spec assembly ─────────────────────────────────────────────────────────

function buildPaths() {
  const paths = {};
  const tagSet = new Set();

  for (const { prefix, tag, router } of ROUTE_GROUPS) {
    tagSet.add(tag);
    const overrides = router.docs || {};
    const collected = [];
    walkRouter(router.stack, "", collected);

    for (const { path: routePath, route } of collected) {
      const meta = inspectRoute(route);
      const fullPath = expressPathToOpenApi(prefix + routePath);
      paths[fullPath] = paths[fullPath] || {};

      const methods = Object.keys(route.methods).filter((m) => route.methods[m]);
      for (const method of methods) {
        const overrideKey = `${method.toUpperCase()} ${routePath}`;
        paths[fullPath][method] = buildOperation({
          method,
          routePath,
          tag,
          meta,
          override: overrides[overrideKey],
        });
      }
    }
  }

  // Standalone health endpoint (mounted directly on the API router).
  paths["/api/health"] = {
    get: {
      tags: ["System"],
      summary: "Liveness probe",
      responses: { 200: { description: "OK" } },
    },
  };
  tagSet.add("System");

  return { paths, tags: [...tagSet].map((name) => ({ name })) };
}

const { paths, tags } = buildPaths();

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Gamru Backend API",
    version: "1.0.0",
    description:
      "Gamru CRM / gamification / catalog REST API. This spec is " +
      "auto-derived from the Express routers — Joi schemas attached to " +
      "the validate middleware become OpenAPI request bodies, role/auth " +
      "middlewares supply security and response codes. See src/docs/swagger.js.",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      serviceKey: {
        type: "apiKey",
        in: "header",
        name: "x-service-key",
      },
    },
  },
  tags,
  paths,
};

module.exports = { swaggerSpec };
