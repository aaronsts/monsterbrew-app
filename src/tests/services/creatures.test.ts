import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredMonster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { getCreature, saveCreature } from "@/services/creatures";

const DB_NAME = "monsterbrewDB";

function creature(overrides: Partial<StoredMonster> = {}): StoredMonster {
  return { ...defaultMonster, id: "c-1", name: "Owlbear", ...overrides };
}

function dropDatabase() {
  return new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

beforeEach(dropDatabase);

afterEach(async () => {
  vi.restoreAllMocks();
  await dropDatabase();
});

describe("saveCreature", () => {
  it("stamps updated_at with the time of the write", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    const saved = await saveCreature(creature());

    expect(saved.updated_at).toBe(1_700_000_000_000);
    expect((await getCreature("c-1"))?.updated_at).toBe(1_700_000_000_000);
  });

  it("advances updated_at when the same creature is saved again", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000);
    await saveCreature(creature());

    now.mockReturnValue(2_000);
    const resaved = await saveCreature(creature({ name: "Owlbear Alpha" }));

    expect(resaved.updated_at).toBe(2_000);
    expect((await getCreature("c-1"))?.updated_at).toBe(2_000);
  });

  it("overwrites a stale updated_at carried in from a restored backup", async () => {
    vi.spyOn(Date, "now").mockReturnValue(5_000);

    const saved = await saveCreature(creature({ updated_at: 1 }));

    expect(saved.updated_at).toBe(5_000);
  });

  it("leaves the rest of the record untouched", async () => {
    const saved = await saveCreature(creature({ name: "Fen Hag" }));

    expect(saved.name).toBe("Fen Hag");
    expect(saved.id).toBe("c-1");
    expect((await getCreature("c-1"))?.name).toBe("Fen Hag");
  });
});
