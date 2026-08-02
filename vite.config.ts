import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import {
  guideChapterPages,
  srdPages,
  staticPages,
} from "./scripts/site-pages.mjs";

// Everything except /library/$id (per-user IndexedDB ids, not enumerable) and
// the localhost-only /dev/* routes. Client-only routes (ssr: false) prerender
// to their static shell. /error is prerendered but noindex, so it lives here
// rather than in the shared sitemap lists.
const prerenderPages = [
  ...staticPages,
  "/error",
  ...guideChapterPages,
  ...srdPages,
];

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN
      ? "hidden"
      : !!process.env.COVERAGE,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: prerenderPages.map((path) => ({
        path,
        prerender: { enabled: true, crawlLinks: false },
      })),
    }),
    nitro(),
    viteReact(),
    // Source-map upload runs only in the production release build, where
    // CI provides SENTRY_AUTH_TOKEN (plus SENTRY_ORG / SENTRY_PROJECT).
    !!process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
        sourcemaps: {
          filesToDeleteAfterUpload: ["./dist/**/*.map", "./.output/**/*.map"],
        },
      }),
  ],
});
