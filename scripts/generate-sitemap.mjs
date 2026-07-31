import { writeFileSync } from "node:fs";
import { guideChapterPages, srdPages, staticPages } from "./site-pages.mjs";

const SITE_URL = "https://monsterbrew.app";

const pages = [...staticPages, ...guideChapterPages, ...srdPages];

const urls = pages
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
console.log(`sitemap: wrote ${pages.length} URLs to public/sitemap.xml`);
