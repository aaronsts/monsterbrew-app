import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Route lists shared by the sitemap generator (generate-sitemap.mjs) and the
// prerender config (vite.config.ts) so the two can't drift.

const require = createRequire(import.meta.url);
const srdMonsters = require("../src/data/srd-monsters.json");

/** Static, indexable routes. The noindex `/error` page is deliberately absent. */
export const staticPages = [
  "/",
  "/editor",
  "/library",
  "/guide",
  "/guide/quick-reference",
  "/changelog",
  "/privacy",
  "/legal",
];

// Slugs derive from content filenames, mirroring `fileToSlug` in
// `src/lib/guide.ts` (locked together by src/tests/guide/guide.test.ts).
export const guideChapterPages = readdirSync(
  fileURLToPath(new URL("../src/content/guide/", import.meta.url)),
)
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => `/guide/${file.replace(/^\d+-/, "").replace(/\.md$/, "")}`);

export const srdPages = srdMonsters.map(
  (monster) => `/library/srd/${monster.key}`,
);
