// After `vite build`: copies dist/index.html to dist/<route>/index.html for every route, so a
// server that only serves files (nginx without a fallback rule) answers /why with the app.
// Docs routes come from src/docs/nav.json; keep the others in sync with src/App.tsx.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const nav = JSON.parse(readFileSync(join(ROOT, "src", "docs", "nav.json"), "utf8"));

const ROUTES = [
  "download", "why", "performance", "docs",
  ...nav.sections.flatMap(s => [`docs/${s.id}`, ...s.items.map(i => `docs/${s.id}/${i.slug}`)]),
  ...JSON.parse(readFileSync(join(ROOT, "src", "generated", "stdlib", "index.json"), "utf8"))
    .namespaces.map(ns => `docs/reference/stdlib/${ns.name}`),
];

for (const r of ROUTES) {
  mkdirSync(join(DIST, r), { recursive: true });
  copyFileSync(join(DIST, "index.html"), join(DIST, r, "index.html"));
}
console.log(`routes: ${ROUTES.length} pages`);
