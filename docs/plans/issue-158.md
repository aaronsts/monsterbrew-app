# Issue #158 — Mobile INP: the slow interaction is editor typing

Follow-up to #155 / #156. The homepage is not the problem; typing in `/editor`
is, and the cost is **presentation delay** — redrawing the statblock preview
after every keystroke.

## Global Constraints

Copied from the issue so nothing downstream drifts from it.

**Measurement setup:** Lighthouse 13.4.1 user flow, **timespan mode**, Moto G
Power + slow 4G + 4× CPU (same settings as PageSpeed Insights).

**Measured interactions:**

| interaction                    | input delay | processing | presentation | total      |
| ------------------------------ | ----------- | ---------- | ------------ | ---------- |
| tap mobile nav (on `/`)        | 17 ms       | 30 ms      | 27 ms        | **74 ms**  |
| tap "Start Brewing" (on `/`)   | 23 ms       | 11 ms      | 7 ms         | **41 ms**  |
| type in editor, empty creature | 27 ms       | 1 ms       | 73 ms        | **101 ms** |
| type in editor, Kraken loaded  | 22 ms       | 2 ms       | **122 ms**   | **146 ms** |

Total Blocking Time is 0 ms on every step except the last one, which is 189 ms.
Field p75 is **234 ms**.

**Reproducing (verbatim):** "Any INP measurement must type into an editor **with
a creature loaded**, and must not measure the navigation tap that loads it. An
empty editor measures 64 ms on a local harness and hides the problem entirely."

**Prototype numbers from #155** (`docs/plans/issue-155.md`, "What this PR does
not do"): scoping the preview subscription measured **136 ms → 104 ms**, with
presentation dropping **116 ms → 79 ms**. Lazy recharts is worth **~91 KB gzip**
on `/editor` (502.9 → 412.6 KB measured).

**Two constraints that are easy to get wrong, both stated in the issue:**

- `React.memo` on the section forms does not work. `Form` is react-hook-form's
  `FormProvider` and `MonsterForm` renders `<Form {...form}>`, which builds a
  new context value on every render, so every `useFormContext()` consumer
  re-renders regardless of memo. **The subscription has to move down.**
- **Both `DeltaBarChart` and `DeltaBarLegend` must go through the lazy
  boundary**, or the module stays in the preload graph and the split buys
  nothing.

**Explicitly out of scope (issue, "Not worth doing"):** the render-blocking CSS
and font-chain items from PageSpeed Insights. LCP, CLS, FCP and TTFB all pass in
the field; INP is the only failing metric.

## Approach

### 1. Move the preview subscription into a leaf

`monster-form.tsx:99` (the issue cites `:76`, its line number at #155 time) is:

```ts
const preview = useWatch({ control: form.control }) as Monster;
```

No `name`, so `MonsterForm` re-renders on every keystroke anywhere in the form,
rebuilding the `FormProvider` context value and re-rendering all four section
forms with it.

**New file `src/app/editor/components/statblock-preview.tsx`:**

- `StatblockPreview` takes no props; reaches the form via `useFormContext()`,
  matching the section-form convention.
- Owns the `useWatch({ control })` subscription that moves out of `MonsterForm`.
- Wraps the watched value in `useDeferredValue`.
- Renders `memo`-wrapped `MonsterStatblock` and `MonsterDescription`.

The `memo` is load-bearing, not decoration. On the urgent render pass
`useDeferredValue` hands back the _previous_ object, so memoized children bail
out with no work at all; the statblock redraw happens in the later, interruptible
pass. Without memo, the children re-render on the urgent pass anyway and
`useDeferredValue` buys nothing.

`MonsterForm` then: drops the `useWatch` import and call, drops the
`MonsterStatblock` / `MonsterDescription` imports and the `Monster` type import
if it becomes unused, and renders `<StatblockPreview />` inside the existing
sticky column (`monster-form.tsx:199-205`).

### 2. Move `usePassivePerception` off the parent too

Agreed as in-scope beyond the issue text. `usePassivePerception(form)` at
`monster-form.tsx:89` calls `useWatch` on `ability_scores.wis`, `skills`,
`cr.proficiency_bonus` and `custom_passive_perception`. Left in `MonsterForm`, it
keeps the exact defect fix 1 removes: typing a WIS score or toggling a skill
re-renders the whole editor.

**New file `src/app/editor/components/derived-values.tsx`:** `DerivedValues`, a
headless component (`return null`) mounted inside `<Form>`. It became the hook's
only caller, so rather than keep a one-consumer indirection the derivation was
inlined into it and `src/hooks/use-passive-perception.ts` deleted — the
component *is* the hook now. Behaviour is unchanged, and
`derived-values.test.tsx` covers both the derived and the
`custom_passive_perception` paths.

After this, nothing above the leaves subscribes to form _values_. `MonsterForm`
still re-renders for `useSaveNudge` (threshold-based), `useAutoSave` status, the
`useCreature` query and launcher state — all infrequent, none per-keystroke.
`useSaveNudge` and `useAutoSave` already use `form.subscribe`, which does not
re-render.

### 3. Lazy-load recharts out of the editor route

`delta-chart.tsx:7` statically imports `DeltaBarChart` and `DeltaBarLegend` from
`@/components/delta-bar-chart`, which pulls `src/components/ui/chart.tsx` and
recharts into the editor's initial graph — even though the chart is inside a
closed `Collapsible` and is not mounted until the user expands it.

Rather than two `lazy()` calls with `.then(m => ({ default: m.X }))`, add one
module that both components cross together:

- **New `src/app/editor/components/cr-calculator/delta-chart-body.tsx`** —
  statically imports both components, default-exports a component that renders
  `<DeltaBarChart>` + `<DeltaBarLegend>` from a `data` prop.
- `delta-chart.tsx` keeps `deltaChartData`, `describeDeltas` and the
  `Collapsible`, and renders `<Suspense><LazyDeltaChartBody …/></Suspense>`
  inside `CollapsibleContent`.

This guarantees a single chunk, one round-trip, and that neither component can
be left behind on the static side.

`import type { DeltaBarDatum }` stays — type imports are erased and create no
runtime edge.

**Suspense fallback:** skeletons standing in for both the chart's box
(`aspect-square w-full sm:aspect-5/2 lg:aspect-4/1`) *and* the legend's line.
Base UI's collapsible measures its panel exactly once as it opens and has no
`ResizeObserver`, so whatever the fallback stands at is the height the animation
targets; with `overflow-hidden` on the panel, anything the real content adds
beyond that is clipped for the duration of the transition. Reserving only the
chart's box would clip the legend.

**Chunk-fetch failure:** the `import()` is `.catch()`-ed to a small "couldn't be
loaded" component. There is no error boundary between here and the router's
`defaultErrorComponent`, so a rejected import — a deploy rotating hashed assets
under a long-lived editor tab is the realistic case — would otherwise unmount
`MonsterForm` and lose an unsaved creature. The `sr-only` delta summary still
carries the numbers.

Note `src/app/guide/components/combat-roles-chart.tsx` also imports
`delta-bar-chart` statically. That is a different route entry, so it keeps
recharts in its own graph — the editor route is what this removes it from.

## Files to touch

| file                                                           | change                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/app/editor/components/statblock-preview.tsx`              | **new** — scoped subscription + deferred, memoized preview                                                    |
| `src/app/editor/components/statblock-preview.test.tsx`         | **new** — render-count + rendering tests                                                                      |
| `src/app/editor/components/derived-values.tsx`                 | **new** — headless passive-perception host                                                                    |
| `src/app/editor/components/monster-form.tsx`                   | drop whole-form `useWatch` + `usePassivePerception`; render the two new leaves                                |
| `src/app/editor/components/cr-calculator/delta-chart-body.tsx` | **new** — the lazy boundary's default export                                                                  |
| `src/app/editor/components/cr-calculator/delta-chart.tsx`      | `lazy` + `Suspense` around the body                                                                           |
| `src/app/editor/components/cr-calculator/delta-chart.test.tsx` | `getByText` → `await findByText` for the now-async chart                                                      |
| `CLAUDE.md`                                                    | "Editor data flow" says the statblock is "fed the watched form value" by `MonsterForm`; that stops being true |

No schema change, so none of the schema ripple list (converters, statblock
renderer, IndexedDB migration) applies.

## Test strategy

**Unit, written first** — `statblock-preview.test.tsx` (red before the component
exists):

1. _Renders the creature from form values._ Renders `<StatblockPreview />`
   through `renderWithForm` and asserts the statblock shows the seeded name —
   proves the relocated subscription still feeds the preview.
2. _Updates when a form value changes._ `setValue("name", …)` then
   `await findByText(…)` — deferred, so this must be an async query.
3. **The regression guard:** a sibling `useFormContext()` consumer standing in
   for the section forms, counting its own renders. Changing a form value
   re-renders the preview and leaves the sibling's count untouched. This is the
   test that fails the day someone reintroduces a whole-form `useWatch` above
   the leaves.

**Unit, updated** — `delta-chart.test.tsx`: the "reveals the chart when the
trigger is clicked" case currently asserts synchronously after the click; the
legend now arrives with the lazy chunk, so it becomes `await findByText`. The
four `deltaChartData` cases are pure and unaffected.

**e2e:** no new specs. The full suite is the check that a deferred preview and an
async chart did not break the existing statblock assertions — those all go
through auto-retrying `expect(locator)` matchers, so they should hold, but "should"
is not a run.

## Verification

- `pnpm exec vitest run` — full suite. Baseline on this worktree: **528 passing,
  54 files**.
- `pnpm lint` — baseline: **0 errors, 9 pre-existing warnings** (unused
  eslint-disable directives in `src/routes/*`).
- `pnpm test:coverage` — CI runs the unit suite under coverage on a slower
  runner; per CLAUDE.md, reproduce there before pushing.
- `E2E_PORT=3158 pnpm exec playwright test` — full e2e suite.
- `pnpm build` before and after — confirm recharts leaves the `/editor` initial
  chunk graph, and report the actual byte delta rather than reusing #155's
  measured 91 KB.
- **INP** — the settings in Global Constraints, against a production build,
  typing into an editor **with a creature loaded**, with the navigation tap that
  loads it excluded from the measured span. **Caveat to carry into the PR:** a
  locally throttled desktop is a relative before/after instrument, not a
  predictor of the 234 ms field p75.

### How INP was measured — no harness ships

The numbers below came from a **throwaway Lighthouse script, run locally and not
committed**. Like #155's `scripts/profile-inp.mjs`, no measurement tooling lands
in the repo; reproducing this means driving Lighthouse yourself. What the script
did, recorded so a future attempt starts from the same setup rather than
guessing:

- **Lighthouse 13.4.1, `startFlow` user-flow API**, `formFactor: "mobile"` and
  `throttlingMethod: "devtools"` — timespan mode does not support simulated
  throttling, and devtools throttling is what the mobile preset's slow 4G + 4×
  CPU resolve to. It drove the page through `puppeteer-core`, which is what
  Lighthouse's flow API takes (it does not accept a Playwright page) and which
  Lighthouse already depends on; Chrome came from Playwright's installed
  browser, so nothing extra was downloaded.
- **Flow:** navigate to `/library/srd/srd-2024_kraken` → click "Copy to editor"
  **outside** any timespan (actions between steps are not measured, which is how
  the issue's "must not measure the navigation tap" constraint is met) →
  `startTimespan` → type → `endTimespan`. Repeated on a blank editor, mirroring
  the issue's last two table rows.
- **Read from:** `interaction-to-next-paint` for the total and
  `inp-breakdown-insight` for the phase split — the INP audit itself carries no
  `details`, only the number.

Two traps worth repeating, because both produced a plausible-looking number
rather than an error:

- **Assert the name field took focus before typing.** The launcher dialog holds
  focus through its exit animation (the trap `gotoBlankEditor` documents in
  `e2e/helpers.ts`), so the blank-editor burst went to `<body>` and reported
  **3 ms** instead of the ~83 ms it actually costs.
- **Print the measured element's selector.** `inp-breakdown-insight` includes the
  node, so a burst that lands on the wrong thing is visible rather than silently
  averaged in.

## Results

Median of 3 runs per side, same machine, production builds, settings as
reported by Lighthouse: 412×823 @1.75×, devtools throttling, 4× CPU, 562.5 ms
RTT.

### INP

| scenario | phase | before | after |
|---|---|---|---|
| type in editor, Kraken loaded | **INP** | **132 ms** | **103 ms** |
| | input delay | 1 ms | 0 ms |
| | processing | 84 ms | 64 ms |
| | presentation | 45 ms | 39 ms |
| | total blocking time | 212 ms | **17 ms** |
| type in editor, empty creature | **INP** | **83 ms** | **74 ms** |
| | total blocking time | 1 ms | 0 ms |

Individual runs — Kraken: 132/129/139 before, 103/96/105 after. Empty:
81/99/83 before, 74/84/72 after.

**The phase split differs from the issue's.** The issue measured the Kraken case
as 2 ms processing / 122 ms presentation; this harness measures the same case as
84 ms processing / 45 ms presentation before the fix. Same tool, same mode,
different machine and different Chrome — so treat the *split* as
harness-specific and only the before/after delta on one machine as meaningful.
Either way the work being cut is the same work.

**The clearest signal is total blocking time: 212 ms → 17 ms** on the Kraken
typing burst. That is the whole-editor re-render leaving the main thread; INP
moves less because a large part of what remains is the statblock redraw itself,
now deferred rather than eliminated.

### Bundle

`/editor`'s initial graph — the chunks its prerendered HTML preloads, plus
everything they statically import, walked transitively (dynamic imports
deliberately not followed):

| | before | after |
|---|---|---|
| chunks | 37 | 36 |
| gzip | 509.1 KB | **418.0 KB** |
| recharts in the graph | yes (`delta-bar-chart`, 91.2 KB gzip) | **no** |

**−91.1 KB gzip (−17.9%)**, matching #155's predicted ~91 KB. Confirmed at
runtime too: with the CR calculator on screen but collapsed, no recharts request
is made; expanding "Benchmark deltas" then fetches `delta-chart-body`,
`delta-bar-chart`, `recharts`, `chart` and `use-is-mobile` together.

## Deliberately not doing

- **`useCrComparison` is mounted ~12×**, each watching the same 14 fields. #155
  measured processing time at 0–2 ms, which is exactly where duplicate
  `compareToCr` calls would surface. No evidence it costs anything.
- **Render-blocking CSS / font chain** — the issue rules these out.
- **Memoizing the section forms** — cannot work through `FormProvider`, per the
  constraint above.
