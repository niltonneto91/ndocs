import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

await mkdir(".tmp", { recursive: true });

await build({
  entryPoints: ["prisma/seed.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: ".tmp/seed.mjs",
  packages: "external",
  logLevel: "silent"
});

await import(pathToFileURL(`${process.cwd()}/.tmp/seed.mjs`).href);
