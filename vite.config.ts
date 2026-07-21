import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 3000 },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    // TanStack Start (Nitro-less core) emits dist/client + dist/server. Nitro's
    // Vite plugin is what compiles that server output into a Vercel Build Output
    // (.vercel/output) so Vercel serves it as a Function — without it every route
    // 404s (NOT_FOUND). `vite dev` still runs a full SSR dev server locally.
    tanstackStart(),
    nitro(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
});
