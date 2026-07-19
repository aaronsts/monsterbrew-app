import { describe, it, expect } from "vitest";
import { migrateCreature } from "@/services/migrations/migrateCreature";
import { defaultCreature } from "@/schema/createCreatureSchema";
import { monsterSchema } from "@/schema/monster-schema";

describe("migrateCreature", () => {
  it("migrates a valid legacy record into a monsterSchema-valid creature", () => {
    const result = migrateCreature({
      ...defaultCreature,
      id: "abc-123",
      name: "Goblin",
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;

    expect(result.creature.id).toBe("abc-123");
    const { id: _id, is_public: _isPublic, ...monster } = result.creature;
    void _id;
    void _isPublic;
    expect(() => monsterSchema.parse(monster)).not.toThrow();
  });

  it("reports an error and does not convert an invalid record", () => {
    const result = migrateCreature({ name: "only a name" });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;

    expect(result.reason.length).toBeGreaterThan(0);
    expect(result).not.toHaveProperty("creature");
  });

  it("errors (rather than throwing) on non-object input", () => {
    expect(migrateCreature(null).status).toBe("error");
    expect(migrateCreature(undefined).status).toBe("error");
    expect(migrateCreature("nope").status).toBe("error");
  });
});
