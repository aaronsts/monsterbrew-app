import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDB } from "idb";
import type { z } from "zod";
import type { StoredMonster } from "@/schema/monster-schema";
import type { createCreatureSchema } from "@/schema/createCreatureSchema";
import { monsterbrewDB } from "@/services/database";
import { defaultCreature } from "@/schema/createCreatureSchema";
import { defaultMonster, monsterSchema } from "@/schema/monster-schema";

type LegacyCreature = z.infer<typeof createCreatureSchema>;

const DB_NAME = "monsterbrewDB";

/** Strip storage-only identity fields so the rest can be schema-validated. */
function monsterPart(stored: StoredMonster) {
  const { id: _id, is_public: _isPublic, ...monster } = stored;
  return monster;
}

/** Seed a v1 database (store only, no migration) with the given records. */
async function seedV1(records: Array<unknown>) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore("creatures", { keyPath: "id" });
    },
  });
  for (const record of records) {
    await db.put("creatures", record);
  }
  db.close();
}

beforeEach(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
});

afterEach(async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

describe("monsterbrewDB v1 -> v2 upgrade", () => {
  it("converts a legacy record to the Monster shape on upgrade", async () => {
    const legacy: LegacyCreature = {
      ...defaultCreature,
      id: "legacy-1",
      name: "Goblin",
      saving_throws: ["dex", "con"],
      skill_bonuses: [
        {
          skill_name: "stealth",
          skill_modifier: "dex",
          is_proficient: true,
          is_expert: false,
        },
      ],
      damage_immunities: ["fire"],
    };
    await seedV1([legacy]);

    const db = await monsterbrewDB();
    const migrated = (await db.get("creatures", "legacy-1")) as StoredMonster;
    db.close();

    expect(migrated).toBeDefined();
    expect(migrated.id).toBe("legacy-1");
    // saving_throws is now an object, not an array.
    expect(Array.isArray(migrated.saving_throws)).toBe(false);
    expect(migrated.saving_throws).toEqual({ dex: true, con: true });
    expect(migrated.skills).toEqual({ stealth: "proficient" });
    expect(migrated.damage_modifiers).toEqual({ fire: "immune" });
    expect(monsterSchema.safeParse(monsterPart(migrated)).success).toBe(true);
  });

  it("leaves an already-Monster record untouched (idempotent)", async () => {
    const monster: StoredMonster = {
      ...defaultMonster,
      id: "monster-1",
      name: "Owlbear",
      saving_throws: { str: true },
      skills: { perception: "expert" },
    };
    await seedV1([monster]);

    const db = await monsterbrewDB();
    const stored = (await db.get("creatures", "monster-1")) as StoredMonster;
    db.close();

    // Not double-converted: object shape preserved verbatim.
    expect(stored.saving_throws).toEqual({ str: true });
    expect(stored.skills).toEqual({ perception: "expert" });
    expect(monsterSchema.safeParse(monsterPart(stored)).success).toBe(true);
  });

  it("migrates a mixed store: legacy converted, monster preserved", async () => {
    const legacy: LegacyCreature = {
      ...defaultCreature,
      id: "legacy-2",
      name: "Kobold",
      saving_throws: ["dex"],
    };
    const monster: StoredMonster = {
      ...defaultMonster,
      id: "monster-2",
      name: "Bear",
      saving_throws: { con: true },
    };
    await seedV1([legacy, monster]);

    const db = await monsterbrewDB();
    const migratedLegacy = (await db.get(
      "creatures",
      "legacy-2",
    )) as StoredMonster;
    const preservedMonster = (await db.get(
      "creatures",
      "monster-2",
    )) as StoredMonster;
    db.close();

    expect(migratedLegacy.saving_throws).toEqual({ dex: true });
    expect(preservedMonster.saving_throws).toEqual({ con: true });
    expect(monsterSchema.safeParse(monsterPart(migratedLegacy)).success).toBe(
      true,
    );
    expect(monsterSchema.safeParse(monsterPart(preservedMonster)).success).toBe(
      true,
    );
  });

  it("re-opening after upgrade is a no-op (records stay Monster-shaped)", async () => {
    const legacy: LegacyCreature = {
      ...defaultCreature,
      id: "legacy-3",
      name: "Zombie",
      saving_throws: ["wis"],
    };
    await seedV1([legacy]);

    // First open runs the upgrade.
    (await monsterbrewDB()).close();
    // Second open is already at v2 — no upgrade, value unchanged.
    const db = await monsterbrewDB();
    const stored = (await db.get("creatures", "legacy-3")) as StoredMonster;
    db.close();

    expect(stored.saving_throws).toEqual({ wis: true });
    expect(monsterSchema.safeParse(monsterPart(stored)).success).toBe(true);
  });
});
