import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const guidePages = [
  "/guide",
  "/guide/quick-reference",
  ...readdirSync(
    fileURLToPath(new URL("./src/content/guide/", import.meta.url)),
  )
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => `/guide/${file.replace(/^\d+-/, "").replace(/\.md$/, "")}`),
];

export default defineConfig({
  server: { port: 3000 },
  resolve: { tsconfigPaths: true },
  build: {
    sourcemap: process.env.SENTRY_AUTH_TOKEN
      ? "hidden"
      : !!process.env.COVERAGE,
  },
  optimizeDeps: {
    include: [
      "use-sync-external-store/shim",
      "use-sync-external-store/shim/with-selector",
    ],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: guidePages.map((path) => ({
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
