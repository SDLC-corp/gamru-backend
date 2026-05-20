import { allPaths, allTags } from "../docs";

/**
 * Swagger spec is now assembled programmatically from per-module
 * `src/docs/*.docs.ts` files instead of scraped from JSDoc comments
 * on route files. To document a new endpoint, add its definition to
 * the matching docs file (or create a new one and register it in
 * `src/docs/index.ts`).
 */
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Backend API",
    version: "1.0.0",
    description: "Node.js TypeScript REST API with Sequelize ORM",
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: allTags,
  paths: allPaths,
};
