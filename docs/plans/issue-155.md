# Issue #155 — Mobile INP over 200ms on `/` and `/editor`

**Scope shipped: `/` bundle reduction only.** The `/editor` work described in
the issue was investigated, prototyped and measured, then deliberately left out
— see [What this PR does not do](#what-this-pr-does-not-do). `/editor`'s own
code is untouched by this PR.

## What ships

Two changes, both in the shared entry graph, both cutting JavaScript off the
critical path of every route:

1. **`cn` no longer drags zod onto every page.**
2. **The Sentry SDK loads on idle instead of during hydration.**

Measured on a production build with `VITE_SENTRY_DSN` set (see
[the DSN trap](#the-dsn-trap)):

| route | before | after | change |
|---|---|---|---|
| `/` | 221.6 KB gzip | **177.9 KB gzip** | **−43.7 KB (−19.7%)** |
| `/editor` | 530.3 KB gzip | 502.9 KB gzip | −27.4 KB (−5.2%) |

`/editor` improves only because both fixes live in the shared entry chunk; no
editor code changed.

## 1. `cn` was pulling zod onto the marketing pages

`src/lib/utils.ts` had a **runtime value import from the legacy Zod schema**:

```ts
import { Languages } from "@/schema/createCreatureSchema";
```

It existed for exactly one exported function, `partitionLanguages`, which has
two importers — both in `src/services/` (`creatureToMonster`,
`monster-mappers`). Nothing on the homepage touches it.

But `utils.ts` also exports `cn()`, imported by **69 files** including
`__root.tsx`, `main-navigation.tsx` and `mobile-navigation.tsx` — i.e. every
route. So `cn` dragged in:

- **zod**, plus `createCreatureSchema`'s `z.object({...})` calls, which run at
  module scope. Not just parse cost: schema *construction* executed during
  hydration, on every route, on every visit.
- `./constants` (for `CREATURE_SIZES`, used by `calculateHitPoints`) — 490
  lines carrying `CHALLENGE_RATINGS` (341 lines) and `CREATURE_TYPES`.

The built chunk contained 28 zod `invalid_type` strings and 35
`challenge_rating` occurrences, all on the marketing page. Tree-shaking cannot
remove it: a module-scope function call is not provably side-effect-free.

**Fix** — move the two offending symbols out, rather than repointing 69 `cn`
imports:

- `partitionLanguages` → `src/lib/languages.ts` (+ a unit test it never had).
- `CREATURE_SIZES` → `src/lib/creature-sizes.ts`, re-exported from
  `constants.ts` so its existing importers are untouched.

Result: `utils-*.js` drops from 96.9 KB raw / 26.4 KB gzip to 28.1 KB / 9.0 KB,
and zod leaves the homepage graph entirely.

## 2. Sentry off the critical path

`src/lib/sentry.ts` was a side-effect import calling `Sentry.init()` at module
scope, so the SDK sat in the entry chunk — parsed, compiled and executed before
hydration finished, on every route. It now loads behind `requestIdleCallback`
(with a `setTimeout` fallback), and `router.tsx`'s `defaultOnCatch` goes through
`captureError`, which pulls the SDK in on demand if an error beats the idle
callback.

Trade-off: errors thrown between first paint and idle are not reported. Those
are overwhelmingly render errors, which the router's error boundary routes
through `captureError` anyway — so they still arrive, a beat later.

### The DSN trap

This change is **invisible in a normal local build**. `VITE_SENTRY_DSN` is only
set for the Production environment, and Vite replaces the undefined value at
build time, so `if (import.meta.env.VITE_SENTRY_DSN)` becomes dead code and the
entire SDK is tree-shaken away. A DSN-less A/B shows a ~3 KB difference and
suggests the change is pointless; the real production delta is **27.3 KB gzip**
off the entry chunk. Every measurement here was taken with a dummy DSN set on
both sides.

### The tree-shaking trap

The first attempt produced a **150 KB gzip** lazy chunk against the 27 KB the
SDK occupied when static — a regression disguised as an improvement, since the
bytes merely moved to an idle download. Cause: the loader did
`import("@sentry/react").then((Sentry) => { ...; return Sentry })`, and holding
the module namespace defeats tree-shaking across a dynamic boundary.
Destructuring only `init` and `captureException`, and never handing the
namespace back out, brings the lazy chunk to **27.9 KB** — the same bytes as
before, now off the critical path instead of on it.
`dev/components/sentry-test.tsx` was switched from `import * as Sentry` to
named imports for the same reason.

## Measurement tooling

`scripts/profile-inp.mjs` (+ `pnpm profile:inp`) serves the production build,
drives it in a mobile-emulated Chromium with the CPU throttled, and reports each
interaction's INP split into input delay / processing / presentation via
`PerformanceObserver` over `event` entries grouped by `interactionId`.

Kept because acceptance criterion 1 asks for a throttled-mobile profile and
criterion 3 asks for a re-measurement, and neither is repeatable without it. Two
flaws found and fixed while building it, both of which had hidden real
behaviour:

- It typed into an **empty** editor. A blank statblock is trivial to re-render,
  so it reported a healthy 64 ms and concealed the editor problem entirely. With
  a real creature loaded (the Kraken) the same scenario measured 136 ms.
- The heavy scenario then measured the **wrong interaction**: it must tap "Copy
  to editor" to load the creature, and that route change beat every keystroke.
  `resetMarks()` now discards setup interactions before the measured burst.

## Results

### INP — median of 5 runs, 6× CPU throttle, Pixel 5 emulation

| scenario | baseline | after |
|---|---|---|
| `/` — tap during hydration | 160 ms | 160 ms |
| `/` — mobile nav after load | 72 ms | 80 ms |
| `/` — tap Start Brewing | 72 ms | 72 ms |

**Dominant phase on `/` is input delay** — 104 ms of the 160 ms, against a
~110 ms hydration long task. That confirms the issue's hypothesis: there is no
handler on the homepage that could take 160 ms; a tap simply waits behind
hydration.

**But cutting 19.7% of the homepage's JavaScript did not move its INP.** The
tap-during-hydration case measures the same before and after. Shortening the
hydration long task did not shorten the window in which a tap can arrive and
wait. Whatever bounds that window is not bundle size at this scale — it is the
cost of hydrating the root shell itself (React + router + the Base UI header
navigation), which this PR does not touch.

So: this is a real and worthwhile **bundle** reduction on `/`. It is **not**
demonstrated to fix `/`'s INP and should not be described as doing so.
Acceptance criteria 3 and 4 are not met for `/` by this work.

**Calibration caveat:** this harness runs on a throttled desktop CPU over
localhost. It is a reliable *relative* instrument for before/after on one
machine, not a predictor of field p75. Real devices are slower than 6×
emulation and real networks are not localhost.

## What this PR does not do

The `/editor` half of the issue was built and measured, then reverted to keep
this PR to the homepage. Recorded so the next attempt starts from evidence:

- **The editor problem is real and reproduces at 136 ms** on a throttled mobile
  profile — but only with a real creature loaded. Any future work must profile
  against a heavy creature, or it will measure 64 ms and conclude there is no
  problem.
- **Scoping the preview subscription works.** `monster-form.tsx:76` calls
  `useWatch({ control })` with no `name`, subscribing the whole editor to every
  keystroke. Extracting a `<StatblockPreview />` that owns its own subscription,
  with `useDeferredValue` and a locally-memoized statblock, measured **136 ms →
  104 ms**, the presentation phase dropping 116 ms → 79 ms. A render-count test
  confirmed the section forms went from re-rendering on every keystroke to not
  re-rendering at all.
- **`React.memo` on the section forms cannot work.** `Form` is RHF's
  `FormProvider` and `MonsterForm` renders `<Form {...form}>`, building a new
  context value every render — so any `MonsterForm` re-render invalidates
  context for every `useFormContext()` consumer beneath it, memo or not. The
  subscription has to move down, not be blocked on the way down.
- **Lazy-loading recharts is worth ~91 KB gzip** on `/editor` (502.9 → 412.6 KB
  measured). Both `DeltaBarChart` and `DeltaBarLegend` must cross the lazy
  boundary; leaving the legend static keeps the module, and recharts with it, in
  the preload graph and buys nothing.
- **`useCrComparison` is mounted 12×**, each watching the same 14 fields. Not
  worth fixing on this evidence: processing time measures 0–2 ms, which is where
  duplicate `compareToCr` calls would show up.

## Rejected along the way

- **Lazy `<Toaster>`.** Eleven modules import `toast`, so Rolldown hoists sonner
  into the shared entry chunk regardless of how the `<Toaster>` loads; making it
  lazy split out only a 765-byte wrapper. Forcing sonner into its own chunk via
  `advancedChunks` then captured **React** as a transitive dependency, leaving
  every chunk importing React from a chunk named "sonner" — a reshuffle with no
  byte saving.
- **Moving `ReactQueryClientProvider` off the root.** Worth ~6 KB gzip, against
  a runtime throw for any query hook rendering outside the new boundary. Removing
  17 KB from `/` had already produced no measurable INP change, so the trade was
  not worth taking.
- **Dropping the `dialog` preload** (4.4 KB gzip). It backs the mobile nav
  sheet — exactly what a mobile visitor taps.

## Verification

- `pnpm exec vitest run` — 447 passing (442 baseline + 5 new for
  `partitionLanguages`).
- `pnpm lint` — 0 errors, 11 pre-existing warnings (unchanged from baseline).
- `E2E_PORT=3155 pnpm exec playwright test` — full suite, 55 passing.
- `pnpm build` + `pnpm profile:inp`, DSN set, before and after.
