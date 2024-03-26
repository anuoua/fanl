import { build } from "bun";

build({
  entrypoints: ["./src/index.ts"],
  external: ["@app-route/core", "@app-route/resolve-restful"],
  outdir: "dist",
});
