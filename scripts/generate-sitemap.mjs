import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const SITE_URL = "https://monsterbrew.app";

const require = createRequire(import.meta.url);
const srdMonsters = require("../src/data/srd-monsters.json");

const staticPaths = [
  "/",
  "/editor",
  "/library",
  "/changelog",
  "/privacy",
  "/legal",
];
const srdPaths = srdMonsters.map((monster) => `/library/srd/${monster.key}`);

const urls = [...staticPaths, ...srdPaths]
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
  `sitemap: wrote ${staticPaths.length + srdPaths.length} URLs to public/sitemap.xml`,
);
