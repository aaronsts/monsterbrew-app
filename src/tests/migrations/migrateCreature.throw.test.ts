import { describe, expect, it, vi } from "vitest";
import { defaultCreature } from "@/schema/createCreatureSchema";

import { migrateCreature } from "@/services/migrations/migrateCreature";
import { creatureToMonster } from "@/services/migrations/creatureToMonster";

// Force the converter to throw so we exercise migrateCreature's defensive catch.
vi.mock("@/services/migrations/creatureToMonster", () => ({
  creatureToMonster: vi.fn(),
}));

const mockedConvert = vi.mocked(creatureToMonster);

describe("migrateCreature — conversion failure", () => {
  it("catches an Error throw and surfaces its message", () => {
    mockedConvert.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const result = migrateCreature({ ...defaultCreature, name: "Explodes" });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.reason).toContain("boom");
  });

  it("catches a non-Error throw and stringifies it", () => {
    mockedConvert.mockImplementationOnce(() => {
      throw "kaboom";
    });

    const result = migrateCreature({ ...defaultCreature, name: "Explodes" });

    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.reason).toBe("kaboom");
  });
});
