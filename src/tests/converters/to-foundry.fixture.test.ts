import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getSrdMonster } from "@/services/srd";
import { monsterToFoundryActor } from "@/services/converters/to-foundry";

/**
 * Locks the exact Foundry actor produced for a real SRD creature. Foundry has no
 * importer here, so a committed fixture is the strongest automated check
 * available: any drift in the mapping fails loudly, and because item ids are
 * derived deterministically the comparison is stable across runs.
 *
 * The Adult Red Dragon exercises the interesting paths at once — a `{@attack}`
 * that becomes a rollable weapon, a `{@save}` breath weapon, legendary actions,
 * proficient saves, expertise, damage immunity and multiple senses.
 *
 * Regenerate deliberately after an intended mapping change:
 *
 *   UPDATE_EXPECTED=1 pnpm exec vitest run src/tests/converters/to-foundry.fixture.test.ts
 *
 * then read the diff before committing it.
 */

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const SRD_KEY = "srd-2024_adult-red-dragon";
const EXPECTED = join(FIXTURE_DIR, "foundry-adult-red-dragon.expected.json");

describe("monsterToFoundryActor — SRD fixture", () => {
  it("matches the committed actor for the Adult Red Dragon", () => {
    const entry = getSrdMonster(SRD_KEY);
    expect(entry, `SRD key ${SRD_KEY} not found`).toBeDefined();

    const actor = monsterToFoundryActor(entry!.monster);

    if (process.env.UPDATE_EXPECTED) {
      mkdirSync(FIXTURE_DIR, { recursive: true });
      writeFileSync(EXPECTED, `${JSON.stringify(actor, null, 2)}\n`);
    }

    expect(
      existsSync(EXPECTED),
      `missing fixture ${EXPECTED} — regenerate with UPDATE_EXPECTED=1`,
    ).toBe(true);

    expect(actor).toEqual(JSON.parse(readFileSync(EXPECTED, "utf8")));
  });

  it("is stable across repeated conversions", () => {
    const entry = getSrdMonster(SRD_KEY)!;
    expect(JSON.stringify(monsterToFoundryActor(entry.monster))).toBe(
      JSON.stringify(monsterToFoundryActor(entry.monster)),
    );
  });
});
