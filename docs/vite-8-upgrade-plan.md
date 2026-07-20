# Vite 8 Upgrade Plan

Upgrade the build tooling from Vite 6 to Vite 8 (Rolldown-based), keeping the
TanStack Start app and its client-side-only architecture unchanged.

## Motivation

- The current TanStack Start starter templates ship on Vite 8.
- This repo is pinned to `vite@^6.3.5` (resolves 6.4.3) — two majors behind.
- Latest `@tanstack/react-start` already declares `vite >=7.0.0` as its peer, so
  the app is arguably running on an under-supported Vite already.

## Compatibility findings

All current TanStack packages support Vite 8; the blocker is the pins in this
repo plus two coordinated major bumps.

| Package | Latest | Vite peer range | Vite 8 |
| --- | --- | --- | --- |
| `@tanstack/react-start` | 1.168.32 | `>=7.0.0` | ✅ |
| `@tanstack/start-plugin-core` | 1.171.24 | `>=7.0.0` | ✅ |
| `@tanstack/router-plugin` | 1.168.23 | `>=5 \|\| >=6 \|\| >=7 \|\| >=8` | ✅ |
| `@tanstack/react-router` | 1.170.18 | — | ✅ |
| `@vitejs/plugin-react` | **6.0.3** | `^8.0.0` | ✅ (v6 **requires** Vite 8) |
| `@tailwindcss/vite` | 4.3.3 | `^5.2 \|\| ^6 \|\| ^7 \|\| ^8` | ✅ |
| `vitest` | **4.1.10** | `^6 \|\| ^7 \|\| ^8` | ✅ |

Two are major bumps with their own migration surface:

- `@vitejs/plugin-react` 4 → 6 (v6 uses Oxc for React Refresh; Babel no longer a
  dependency).
- `vitest` 3 → 4 (current `vitest@3.2.7` peers to Vite 7 and will not tolerate
  Vite 8, so this bump is effectively mandatory).

## Risks

- **Known bug — [TanStack/router #7614](https://github.com/TanStack/router/issues/7614):**
  on Vite 8 the Start dev server can silently skip its SSR middleware, yielding
  `Cannot GET /`. This is the primary go/no-go gate. Verify against the exact
  `@tanstack/react-start` version we land on.
- **Rolldown bundler:** Vite 8 replaces Rollup with Rolldown. Watch for plugin
  ordering / config incompatibilities in `vite.config.ts`.
- **Vitest 4:** config and API changes; the converters are the most test-covered
  area (`src/tests/converters/`) and are where regressions would surface first.

## Proposed dependency changes

Branch off `main` (do **not** stack on `feat/migrate-to-tanstack`).

```jsonc
"vite":                 "^8.1.5",   // was ^6.3.5
"@vitejs/plugin-react": "^6.0.3",   // was ^4.4.1  (major)
"vitest":               "^4.1.10",  // was ^3.2.7  (major)
"@vitest/coverage-v8":  "^4.1.10",  // keep in lockstep with vitest
"@vitest/ui":           "^4.1.10",  // keep in lockstep with vitest
"@tanstack/react-start": "latest",  // ensure the >=7-peer build
"@tailwindcss/vite":    "^4.3.3",
```

## Steps

1. **Branch:** `chore/vite-8` off `main`; apply the bumps; `pnpm install`. Read
   the peer-warning output — it is the truth of what remains mismatched.
2. **Build:** `pnpm build`. Vite 8 is Rolldown-based; watch for plugin/config
   breakage in `vite.config.ts`.
3. **Test:** `pnpm exec vitest run`. Expect a few Vitest 4 config/API
   adjustments. Riskiest step given the converter coverage.
4. **Smoke test (go/no-go):** `pnpm dev` and exercise the editor and SSR
   marketing routes specifically against #7614 — confirm SSR routes actually
   render and there is no `Cannot GET /`.
5. **Verify:** `pnpm lint` and `pnpm exec tsc`.

## Go / no-go

Step 4 is the gate. If #7614 bites on the `@tanstack/react-start` version we land
on, pause the upgrade until Start ships the fix rather than working around it.

## Definition of done

- `pnpm build`, `pnpm exec vitest run`, `pnpm lint`, `pnpm exec tsc`, and the e2e
  suite all pass on Vite 8.
- Dev server and production `pnpm start` both serve SSR routes correctly.
- CLAUDE.md references to Vite are still accurate (they are version-agnostic
  today, so likely no change needed).
