import { describe, expect, it } from "vitest";
import {
  NO_CREATURE_FILTERS,
  filterCreatureEntries,
  hasActiveCreatureFilters,
  mergeCreatureEntries,
  recentCreatures,
  starterFromEntry,
} from "./helpers";
import type { StoredMonster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

function stored(
  id: string,
  name: string,
  updated_at?: number,
): StoredMonster {
  return { ...defaultMonster, id, name, updated_at };
}

const names = (list: Array<StoredMonster>) => list.map((c) => c.name);

describe("recentCreatures", () => {
  it("orders stamped records by updated_at, most recent first", () => {
    const list = [
      stored("1-a", "Owlbear", 3_000),
      stored("2-b", "Fen Hag", 9_000),
      stored("3-c", "Kobold", 6_000),
    ];

    expect(names(recentCreatures(list, 4))).toEqual([
      "Fen Hag",
      "Kobold",
      "Owlbear",
    ]);
  });

  it("falls back to the id's creation timestamp when a record has no updated_at", () => {
    // Records saved before `updated_at` existed. Ids are `${Date.now()}-random`.
    const list = [
      stored("1000-a", "Older"),
      stored("9000-b", "Newer"),
    ];

    expect(names(recentCreatures(list, 4))).toEqual(["Newer", "Older"]);
  });

  it("compares stamped and un-stamped records on the same timeline", () => {
    // Both clocks are ms since epoch, so a stamp beats an older creation time
    // and loses to a newer one.
    const list = [
      stored("5000-a", "Never resaved"),
      stored("1000-b", "Old but freshly edited", 7_000),
      stored("9000-c", "Created last"),
    ];

    expect(names(recentCreatures(list, 4))).toEqual([
      "Created last",
      "Old but freshly edited",
      "Never resaved",
    ]);
  });

  it("caps the list at the requested limit", () => {
    const list = [
      stored("1-a", "One", 1_000),
      stored("2-b", "Two", 2_000),
      stored("3-c", "Three", 3_000),
      stored("4-d", "Four", 4_000),
      stored("5-e", "Five", 5_000),
    ];

    expect(names(recentCreatures(list, 3))).toEqual(["Five", "Four", "Three"]);
  });

  it("sorts records with an unparseable id last, alphabetically by name", () => {
    const list = [
      stored("legacy-zombie", "Zombie"),
      stored("1000-a", "Goblin"),
      stored("legacy-bandit", "Bandit"),
    ];

    expect(names(recentCreatures(list, 4))).toEqual([
      "Goblin",
      "Bandit",
      "Zombie",
    ]);
  });

  it("returns an empty array when nothing is saved", () => {
    expect(recentCreatures([], 4)).toEqual([]);
  });

  it("does not mutate the array it is given", () => {
    const list = [stored("1-a", "First", 1_000), stored("2-b", "Second", 2_000)];

    recentCreatures(list, 4);

    expect(names(list)).toEqual(["First", "Second"]);
  });
});

function entry(
  name: string,
  { size = "medium", type = "humanoid", cr = "1" } = {},
) {
  return {
    key: `srd-2024_${name.toLowerCase().replace(/\s+/g, "-")}`,
    source: "srd" as const,
    monster: {
      ...defaultMonster,
      name,
      size,
      type,
      cr: { ...defaultMonster.cr, challenge_rating: cr },
    },
  };
}

const BESTIARY = [
  entry("Owlbear", { size: "large", type: "monstrosity", cr: "3" }),
  entry("Aboleth", { size: "large", type: "aberration", cr: "10" }),
  entry("Goblin", { size: "small", type: "humanoid", cr: "1/4" }),
  entry("Giant Owl", { size: "large", type: "celestial", cr: "1/4" }),
];

const entryNames = (list: ReturnType<typeof filterCreatureEntries>) =>
  list.map((e) => e.monster.name);

describe("filterCreatureEntries", () => {
  it("returns everything when no filter is set", () => {
    expect(filterCreatureEntries(BESTIARY, NO_CREATURE_FILTERS)).toHaveLength(4);
  });

  it("narrows by name, case-insensitively and ignoring stray whitespace", () => {
    const found = filterCreatureEntries(BESTIARY, {
      ...NO_CREATURE_FILTERS,
      search: "  OWL ",
    });

    expect(entryNames(found)).toEqual(["Owlbear", "Giant Owl"]);
  });

  it("narrows by size", () => {
    const found = filterCreatureEntries(BESTIARY, { ...NO_CREATURE_FILTERS, size: "small" });

    expect(entryNames(found)).toEqual(["Goblin"]);
  });

  it("narrows by creature type", () => {
    const found = filterCreatureEntries(BESTIARY, {
      ...NO_CREATURE_FILTERS,
      type: "monstrosity",
    });

    expect(entryNames(found)).toEqual(["Owlbear"]);
  });

  it("narrows by challenge rating, including fractional ones", () => {
    const found = filterCreatureEntries(BESTIARY, { ...NO_CREATURE_FILTERS, cr: "1/4" });

    expect(entryNames(found)).toEqual(["Goblin", "Giant Owl"]);
  });

  it("combines every filter with AND", () => {
    const found = filterCreatureEntries(BESTIARY, {
      search: "owl",
      source: "all",
      size: "large",
      type: "celestial",
      cr: "1/4",
    });

    expect(entryNames(found)).toEqual(["Giant Owl"]);
  });

  it("returns nothing when the combination matches no monster", () => {
    const found = filterCreatureEntries(BESTIARY, {
      ...NO_CREATURE_FILTERS,
      size: "small",
      type: "monstrosity",
    });

    expect(found).toEqual([]);
  });

  it("compares size and type case-insensitively", () => {
    const shouty = [entry("Shouty", { size: "Large", type: "Dragon" })];

    const found = filterCreatureEntries(shouty, {
      ...NO_CREATURE_FILTERS,
      size: "large",
      type: "dragon",
    });

    expect(entryNames(found)).toEqual(["Shouty"]);
  });
});

describe("hasActiveCreatureFilters", () => {
  it("is false when nothing is set", () => {
    expect(hasActiveCreatureFilters(NO_CREATURE_FILTERS)).toBe(false);
  });

  it("ignores whitespace-only search", () => {
    expect(hasActiveCreatureFilters({ ...NO_CREATURE_FILTERS, search: "   " })).toBe(false);
  });

  it.each([
    ["search", { search: "owl" }],
    ["size", { size: "large" }],
    ["type", { type: "dragon" }],
    ["cr", { cr: "3" }],
  ])("is true when %s is set", (_label, partial) => {
    expect(hasActiveCreatureFilters({ ...NO_CREATURE_FILTERS, ...partial })).toBe(true);
  });
});

describe("mergeCreatureEntries", () => {
  const srd = [
    { key: "srd-2024_aboleth", monster: { ...defaultMonster, name: "Aboleth" } },
    { key: "srd-2024_owlbear", monster: { ...defaultMonster, name: "Owlbear" } },
  ];

  it("puts your own creatures ahead of the bestiary", () => {
    const saved = [stored("1-a", "Fen Hag", 5_000)];

    const merged = mergeCreatureEntries(saved, srd);

    expect(merged.map((e) => e.monster.name)).toEqual([
      "Fen Hag",
      "Aboleth",
      "Owlbear",
    ]);
  });

  it("orders your own creatures by recency, and keeps the bestiary as given", () => {
    const saved = [
      stored("1-a", "Older", 1_000),
      stored("2-b", "Newest", 9_000),
      stored("3-c", "Middle", 5_000),
    ];

    const merged = mergeCreatureEntries(saved, srd);

    expect(merged.map((e) => e.monster.name)).toEqual([
      "Newest",
      "Middle",
      "Older",
      "Aboleth",
      "Owlbear",
    ]);
  });

  it("tags each entry with where it came from", () => {
    const merged = mergeCreatureEntries([stored("1-a", "Fen Hag", 1)], srd);

    expect(merged.map((e) => e.source)).toEqual(["personal", "srd", "srd"]);
  });

  it("carries the stored id on your own creatures only", () => {
    const merged = mergeCreatureEntries([stored("fen-hag", "Fen Hag", 1)], srd);

    expect(merged[0].id).toBe("fen-hag");
    expect(merged[1].id).toBeUndefined();
  });

  it("keys your creatures apart from bestiary entries that share a name", () => {
    const merged = mergeCreatureEntries(
      [stored("srd-2024_owlbear", "Owlbear", 1)],
      srd,
    );

    // A saved creature whose id happens to collide with an SRD key must not
    // produce two rows with the same React key.
    expect(new Set(merged.map((e) => e.key)).size).toBe(merged.length);
  });

  it("copes with an empty store and an empty bestiary", () => {
    expect(mergeCreatureEntries([], srd)).toHaveLength(2);
    expect(mergeCreatureEntries([stored("1-a", "Solo", 1)], [])).toHaveLength(1);
    expect(mergeCreatureEntries([], [])).toEqual([]);
  });
});

describe("filterCreatureEntries — source", () => {
  const entries = [
    { key: "personal:1", monster: { ...defaultMonster, name: "Fen Hag" }, source: "personal" as const, id: "1" },
    { key: "srd-2024_owlbear", monster: { ...defaultMonster, name: "Owlbear" }, source: "srd" as const },
  ];

  it("keeps both sources by default", () => {
    expect(filterCreatureEntries(entries, NO_CREATURE_FILTERS)).toHaveLength(2);
  });

  it("narrows to your own creatures", () => {
    const found = filterCreatureEntries(entries, {
      ...NO_CREATURE_FILTERS,
      source: "personal",
    });

    expect(found.map((e) => e.monster.name)).toEqual(["Fen Hag"]);
  });

  it("narrows to the bestiary", () => {
    const found = filterCreatureEntries(entries, {
      ...NO_CREATURE_FILTERS,
      source: "srd",
    });

    expect(found.map((e) => e.monster.name)).toEqual(["Owlbear"]);
  });

  it("counts a source filter as active", () => {
    expect(
      hasActiveCreatureFilters({ ...NO_CREATURE_FILTERS, source: "personal" }),
    ).toBe(true);
  });
});

describe("starterFromEntry", () => {
  it("drops the storage identity when copying one of your creatures", () => {
    const entry = mergeCreatureEntries([stored("fen-hag", "Fen Hag", 1)], [])[0];

    const starter = starterFromEntry(entry);

    // Picking here starts a *new* creature; carrying the id would risk the
    // save path updating the original instead.
    expect("id" in starter).toBe(false);
    expect("is_public" in starter).toBe(false);
    expect(starter.name).toBe("Fen Hag");
  });

  it("passes a bestiary entry through unchanged", () => {
    const monster = { ...defaultMonster, name: "Owlbear" };
    const entry = mergeCreatureEntries([], [{ key: "k", monster }])[0];

    expect(starterFromEntry(entry)).toEqual(monster);
  });
});
