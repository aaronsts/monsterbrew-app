---
name: verify
description: Build/launch/drive recipe for verifying Monsterbrew changes at runtime (e2e suite, dev server, Playwright script).
---

# Verifying Monsterbrew changes at runtime

## Ports: always set one explicitly

`playwright.config.ts` defaults to port 3000 **and** has `reuseExistingServer`
on locally — a run without `E2E_PORT` silently reuses the user's own `pnpm dev`
server and tests the wrong checkout. Pick a unique port (e.g. 3123) for every
run, e2e suite and standalone scripts alike.

## First option: the existing e2e suite

`e2e/` has specs covering the editor, defenses, derived math, import, library,
persistence, auto-save, SRD pages, and converter round-trips. Prefer running
the relevant spec over writing a new script — Playwright boots its own dev
server on `E2E_PORT`, no manual server needed:

```
E2E_PORT=3123 pnpm exec playwright test editor   # one spec
E2E_PORT=3123 pnpm exec playwright test          # full suite
```

(`pnpm test:e2e:coverage` also exists; it does a production build and is slow —
only use it when coverage is the point.)

## Ad-hoc checks: dev server + standalone script

For things the suite doesn't cover:

- Launch an isolated dev server (never reuse port 3000 — the user's own `pnpm dev` may be running there):
  `pnpm exec vite dev --port 3123 --strictPort` (background it; ready in ~2s, check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3123/editor`).
- Drive it with a standalone Playwright script (chromium is already installed for e2e). Scripts living outside the repo can't resolve bare imports; import via
  `import { chromium } from "file:///<repo>/node_modules/@playwright/test/index.mjs";`

## Exploratory looks: the Playwright MCP

When the question is "what does this actually do in the browser" rather than
"does this assertion hold", the `mcp__playwright__browser_*` tools are less
ceremony than authoring a script — you navigate and look, one step at a time.

- It does **not** boot a server or honour `E2E_PORT`. Start the isolated dev
  server first (above), then `browser_navigate` to `http://localhost:3123/...`.
  Skipping that step points the browser at whatever is on 3000 — the user's own
  checkout, the failure this whole skill exists to prevent.
- `browser_snapshot` (accessibility tree) for reading state and finding
  elements; `browser_take_screenshot` only when the question is genuinely
  visual. Snapshots of the editor are large, so take them at the moment you need
  them rather than after every click.
- `browser_close` when you're done — a live browser outlasts the check.

It leaves no artifact. The moment a check is worth repeating, write it as a spec
in `e2e/` instead; a finding that only exists in this conversation cannot fail in
CI when someone breaks it later.

## Handles and quirks

- Useful handles on `/editor`: form inputs have stable ids (`#form-rhf-input-name`, `#form-rhf-input-con`, …); section triggers are `getByRole("button", { name: "Identity" | "Combat" | "Defense" | "Actions", exact: true })`; toasts are `[data-sonner-toast]`; the live statblock preview reflects form state immediately.
- The editor is client-state only (IndexedDB) — a fresh page is always a blank `defaultMonster`, no seeding needed. `page.reload()` resets the form.
- Wait ~400ms after toggling anything animated (Base UI panels) before asserting visibility.
