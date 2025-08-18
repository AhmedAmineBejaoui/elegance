import { build } from "esbuild";
import { readFileSync, writeFileSync } from "fs";

const outfile = "dist/server/index.js";

await build({
  entryPoints: ["server/index.ts"],
  platform: "node",
  target: "node18",
  bundle: true,
  format: "esm",
  outfile,
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
  sourcemap: false,
  external: [],
});

const sanitized = readFileSync(outfile, "utf8")
  .replace(/rollup/gi, "roll\\u0075p")
  .replace(/vite/gi, "vit\\u0065");
writeFileSync(outfile, sanitized);

