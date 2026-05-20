// Production entry shim. Render's Start Command is `node src/server.ts`.
// Node 24+ strips TS types natively; this file has no TS syntax and no
// ESM imports, so it parses as CommonJS and just loads the compiled
// server from dist/. The real entry lives in src/main.ts.
//
// Excluded from tsc (see tsconfig.json) so the build does not overwrite
// it with a compiled version of itself.
require("../dist/main.js");
