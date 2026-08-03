---
name: verify
description: Build/launch/drive recipe for verifying Monsterbrew changes at runtime (dev server + Playwright script).
---

# Verifying Monsterbrew changes at runtime

- Launch an isolated dev server (never reuse port 3000 — the user's own `pnpm dev` may be running there):
  `pnpm exec vite dev --port 3123 --strictPort` (background it; ready in ~2s, check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3123/editor`).
- Drive it with a standalone Playwright script (chromium is already installed for e2e). Scripts living outside the repo can't resolve bare imports; import via
  `import { chromium } from "file:///<repo>/node_modules/@playwright/test/index.mjs";`
- Useful handles on `/editor`: form inputs have stable ids (`#form-rhf-input-name`, `#form-rhf-input-con`, …); section triggers are `getByRole("button", { name: "Identity" | "Combat" | "Defense" | "Actions", exact: true })`; toasts are `[data-sonner-toast]`; the live statblock preview reflects form state immediately.
- The editor is client-state only (IndexedDB) — a fresh page is always a blank `defaultMonster`, no seeding needed. `page.reload()` resets the form.
- Wait ~400ms after toggling anything animated (Base UI panels) before asserting visibility.
