---
name: start-issue
description: Kick off work on a GitHub issue end-to-end (branch, plan, implement, test, changelog, PR). Use when the user types /start-issue <number> or writes "Start issue #<number>" / "start working on issue <number>" / "pick up issue <number>".
---

# Starting work on a GitHub issue

Run this workflow the same way every time. The argument is the issue number
(from `/start-issue 132` or "Start issue #132").

This skill governs the flow end to end. Where a step names a superpowers
sub-skill, invoke it for that step and come back here. Superpowers' own chain
(brainstorming → writing-plans → subagent-driven-development →
finishing-a-development-branch) does **not** apply: it assumes per-task commits,
which are hook-blocked for Claude in this repo, and its default doc paths are
not the ones used here.

## 1. Read the issue

- `gh issue view <number>` and `gh issue view <number> --comments` — read the
  title, body, labels, and any discussion. Comments often contain decisions
  that supersede the body.
- Restate the goal in one or two sentences so the user can catch a
  misunderstanding early.
- A well-specified issue **is** the spec — go straight to step 2. If instead the
  issue leaves the design open (competing approaches, unclear UX, no acceptance
  criteria), say so and settle it first: **REQUIRED SUB-SKILL:** use
  superpowers:brainstorming, then fold the agreed design into the plan doc in
  step 3 rather than writing a separate spec file.

## 2. Branch in an isolated worktree

Issue work always happens in its own worktree, so the user's main checkout
stays clean and several issues can run in parallel.

- Check first whether you are **already** in a linked worktree: compare
  `git rev-parse --git-dir` with `git rev-parse --git-common-dir`. If they
  differ, this checkout is already isolated — work here, don't nest another.
- Check for existing work on this issue first: `git worktree list`,
  `git branch -a | grep "issue-<number>"` and
  `gh pr list --state all --search "<number>"`. If a worktree, branch or PR
  already exists, stop and ask whether to resume it instead of starting fresh.
- `git fetch origin`, then create the worktree and branch together off
  `origin/main`:

  ```
  git worktree add .claude/worktrees/issue-<number> \
    -b <type>/issue-<number>[-short-slug] origin/main
  ```

  `.claude/worktrees/` is gitignored (`.gitignore` line 46), so the worktree
  never shows up as untracked files in the parent checkout.

- `<type>` follows the issue label: `enhancement` → `feat`, `bug` → `fix`,
  `chore` → `chore`. No label: judge from the issue content. The slug is
  optional and only for bigger pieces of work (matches existing history:
  `chore/issue-90`, `fix/issue-139`, `feat/issue-136-composite-tag-grammar`).
- Worktrees do not share `node_modules` — run `pnpm install` inside the new
  worktree before anything else, and run every later command from there.
- Then take a baseline on the untouched worktree: `pnpm exec vitest run` and
  `pnpm lint`, and note what they printed. Step 5 needs it to tell a failure you
  caused from one that was already there. If the baseline is not clean, tell the
  user before implementing.
- Pick a unique `E2E_PORT` for this worktree (e.g. 3123, 3124, …) and use it
  for every Playwright command. Port 3000 with `reuseExistingServer` silently
  tests the user's own dev server in the _parent_ checkout — see the `verify`
  skill.

## 3. Plan before coding

- Explore the relevant code, then write the plan to
  `docs/plans/issue-<number>.md`: files to touch, approach, test strategy
  (including whether e2e coverage is needed), anything the issue leaves open.
  A file rather than a chat message — it survives context compaction and a
  restarted session, and it ships with the PR. Keep it short for small issues;
  a handful of bullets is fine. `docs/plans/` is this repo's path — don't let a
  superpowers sub-skill relocate it to `docs/superpowers/plans/`.
- Where the issue fixes exact values, open the plan with a **Global
  Constraints** section and copy them out of the issue verbatim — numbers,
  strings, field names, formats. Everything below inherits it, and a
  paraphrased constraint is a constraint you will drift from.
- Re-read the plan against the issue once before showing it: does every
  requirement map to something in the plan? Any "TBD", "handle edge cases" or
  "add validation" standing in for a decision you haven't made? Do field and
  function names match between sections? Fix what you find inline.
- Summarise it in chat and **always wait for the user's explicit approval
  before implementing** — even for small, unambiguous issues. No exceptions.

## 4. Implement

- **Write the failing test first** wherever the change is unit-testable —
  converters, schema, the game-rule math in `src/lib/`. Write the test, run it,
  watch it fail for the reason you expect, then implement. A test written after
  the code is shaped by the code instead of by the requirement.
  **REQUIRED SUB-SKILL:** superpowers:test-driven-development.
- Follow CLAUDE.md conventions (canonical `Monster` schema, `{@…}` markup,
  converter test coverage, shadcn/Tailwind rules).
- When a schema field changes, walk the ripple list from CLAUDE.md: schema +
  default, form section, statblock renderer, converters, IndexedDB migration.
- **Test fixtures come from real data, never invented shapes.** For 5eTools /
  bestiary parsing, copy the record out of
  `/Users/rnsts/code/personal/5etools-src/data/bestiary/` and note the source
  file and creature name in a comment above the fixture. Import round-trips get
  a real export dropped into `e2e/fixtures/<format>/` (see that folder's
  README — no code changes needed, the spec picks it up). Before writing a
  parser for a field, survey how that field actually varies across the bestiary
  sources, including 2024-format vs classic, and show the user the variant list
  before coding against it.

## 5. Verify

Run all four, and report what the commands actually printed — never assert a
suite is green without having run it to completion.

- `pnpm exec vitest run` — full unit suite, not a subset.
- `pnpm lint` — unused imports/vars are errors, so run it even for small diffs.
- `E2E_PORT=<port> pnpm exec playwright test` — the **full** e2e suite, on
  every issue. Not just the specs that look related: shared helpers in `e2e/`
  use structural selectors, so a DOM or markup change anywhere can break specs
  that have nothing to do with the feature. This has reached CI before.
- For UI-visible changes, also drive it in a browser via the `verify` skill
  (isolated dev server + Playwright script) rather than claiming it works from
  the diff.

**No claim without fresh output in the same message.** If you have not run the
command in this message, you cannot say it passes — not "should pass", not
"tests are green", not "Done!". A run from earlier in the session proves only
the tree it ran on. **REQUIRED SUB-SKILL:**
superpowers:verification-before-completion.

If something fails, find the cause before changing anything —
**REQUIRED SUB-SKILL:** superpowers:systematic-debugging. Don't describe a
failure as pre-existing or unrelated without checking it against the step 2
baseline and `origin/main` first.

## 6. Review the diff before the PR

This is the review that always runs. Step 11 is an optional deeper pass after
the PR is open; by then the diff is public and CI has started, so catch what you
can here, with a reviewer that has no memory of writing the code.

**Preferred: ask the user to run `/code-review`.** Its default scope is the
branch's commits ahead of upstream *plus uncommitted changes* — exactly this
working tree, with nothing to stage and no diff to assemble. It is marked
`disable-model-invocation`, so you cannot start it yourself: say what it will
cover and wait. Running it locally is ordinary session usage, not usage credits
(`ultra` is the cloud escalation that can bill credits, and it confirms before
charging). It reads CLAUDE.md but not `REVIEW.md`. Don't suggest `--fix` here —
a background review's edits land outside session checkpoints, so `/rewind`
won't undo them.

**Fallback, when the user isn't driving the session:** dispatch the review
yourself.

- `git add -A`, then write the branch diff to a file outside the repo:
  `git diff --staged > /tmp/issue-<number>-diff.txt`. Commits are hook-blocked
  for Claude, so `HEAD` is still the branch point and the staged diff is the
  whole branch. A file, not stdout — the diff belongs in the reviewer's context,
  not yours.
- Don't write the reviewer brief yourself — **REQUIRED SUB-SKILL:**
  superpowers:requesting-code-review, and use the `code-reviewer.md` template in
  that skill's directory. Fill `[DESCRIPTION]` with one line on what you built
  and `[PLAN_OR_REQUIREMENTS]` with the plan doc path plus the issue's
  acceptance criteria. Replace the `[BASE_SHA]`/`[HEAD_SHA]` git-range block
  with the diff file path — there are no commits to range over. Keep the
  template's read-only rule: you have just staged the whole tree, and a reviewer
  that touches the index destroys the hand-off.
- Those are the reviewer's only inputs. Not this session's history — it
  evaluates the work product, not your reasoning about it.
- Don't tell the reviewer what not to flag. If you think a finding will be a
  false positive, let it come back and judge it then.

**Either way:** fix Critical and Important findings before moving on; carry
Minor ones into the confidence check. Re-run step 5 after any fix.

## 7. Confidence check

- Present the finished work to the user with an honest confidence assessment:
  - An overall rating (high / medium / low) on whether the feature does what
    the issue asked, with the reasoning behind it.
  - What was actually verified (which tests, what the runtime check showed)
    versus what is assumed from reading the diff.
  - The specific parts you are least sure about — edge cases, interactions
    with other features, styling, migration behavior.
- **Stop here and wait.** The user reviews and may ask for adjustments;
  iterate until they are satisfied. Only then continue to the changelog and
  commit steps.

## 8. Changelog entry

- Use the `changelog-entry` skill to draft the entry in
  `src/content/changelog/unreleased/`, and show it to the user for wording
  tweaks. Skip only if the change is invisible _and_ the user agrees.

## 9. Hand off the commit

Committing and pushing are blocked for Claude in this repo (by design).
Instead:

- `git add` the intended files (list them) — including the plan doc.
- Give the user copy-pasteable commands with a Conventional Commits message
  referencing the issue. They run from the worktree, so lead with the `cd`:

  ```
  cd .claude/worktrees/issue-132
  git commit -m "feat: add general preset dialog for traits and actions (#132)"
  git push -u origin feat/issue-132-preset-dialog
  ```

- Wait for the user to confirm they have committed and pushed.

## 10. Open the PR

- `gh pr create` with a conventional-commit title (commitlint checks the PR
  title and description in CI; body line length is not limited).
- Body: short summary of the change plus `Closes #<number>`.
- **Not a draft** if step 11 is on the table: the `code-review` skill skips draft
  PRs outright, so `--draft` would silently cancel the review.
- Report the PR URL back to the user.

## 11. Optional: deeper review on the open PR

Step 6 already reviewed this diff, so this pass is opt-in rather than automatic.
Offer it when its extra lenses are likely to earn their cost — the change
touches files with a long history or past PR discussion, the diff is large, or
step 6 found enough that more probably lurks. On a small, self-contained change,
skip it and say you're skipping it.

What it adds over step 6: git blame on the modified lines, comments left on
earlier PRs that touched the same files, guidance sitting in code comments, and
a confidence pass that drops anything under 80. What it costs: five parallel
Sonnet reviewers plus a scorer per finding, and its findings land after CI has
started, so acting on them means another commit hand-off and another CI run.

- Ask the user first. It posts its findings as a comment on the PR — a public
  write on the repo — and it is not free.
- Spawn a subagent with the Agent tool (`general-purpose`) and tell it to invoke
  the `code-review:code-review` skill on the PR number. Keep the brief thin —
  the skill carries its own methodology.
- Run it in a subagent rather than inline: the review fans out over a lot of
  agents, and none of that output needs to land in this session's context.
- `/code-review ultra <PR#>`, run by the user, is the heavier alternative. It
  can bill usage credits and confirms before charging.
- When it comes back, verify each finding against the code before acting on it,
  and push back with technical reasoning where the reviewer is wrong rather than
  implementing it to be agreeable — **REQUIRED SUB-SKILL:**
  superpowers:receiving-code-review. Then summarise for the user, saying which
  findings you think are real. Fixes go through step 9 again — stage, hand over
  the commit and push commands, and let CI re-run.
- If it reports nothing, say so plainly rather than treating silence as a pass;
  the skill only surfaces high-confidence issues and stays quiet below that bar.
