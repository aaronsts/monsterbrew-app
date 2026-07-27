import { readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://monsterbrew.app";

const require = createRequire(import.meta.url);
const srdMonsters = require("../src/data/srd-monsters.json");

const staticPaths = [
  "/",
  "/editor",
  "/library",
  "/guide",
  "/guide/quick-reference",
  "/changelog",
  "/privacy",
  "/legal",
];
const srdPaths = srdMonsters.map((monster) => `/library/srd/${monster.key}`);

// Slugs derive from content filenames, mirroring `fileToSlug` in
// `src/lib/guide.ts` (locked together by src/tests/guide/guide.test.ts).
const guidePaths = readdirSync(
  fileURLToPath(new URL("../src/content/guide/", import.meta.url)),
)
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => `/guide/${file.replace(/^\d+-/, "").replace(/\.md$/, "")}`);

const urls = [...staticPaths, ...guidePaths, ...srdPaths]
  .map((path) => {
    const loc = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
    return `  <url><loc>${loc}</loc></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outFile = new URL("../public/sitemap.xml", import.meta.url);
writeFileSync(outFile, xml);
console.log(
  `sitemap: wrote ${staticPaths.length + guidePaths.length + srdPaths.length} URLs to public/sitemap.xml`,
);
