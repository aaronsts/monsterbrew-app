import { describe, it, expect } from "vitest";
import { detectImportFormat } from "@/services/converters/detect-import-format";

describe("detectImportFormat", () => {
  it("detects Improved Initiative by its PascalCase blocks", () => {
    expect(
      detectImportFormat({ Abilities: { Str: 10 }, HP: { Value: 1 }, AC: { Value: 10 } }),
    ).toBe("improved-initiative");
  });

  it("detects TetraCube by its point fields", () => {
    expect(detectImportFormat({ strPoints: 10, hpText: "10 (2d6)" })).toBe(
      "tetra-cube",
    );
  });

  it("detects 5eTools by size array + source", () => {
    expect(detectImportFormat({ size: ["M"], source: "MM", str: 10 })).toBe(
      "5e-tools",
    );
  });

  it("detects Open5e by full-word ability keys", () => {
    expect(detectImportFormat({ strength: 10, dexterity: 12 })).toBe("open-5e");
  });

  it("returns null for unrecognised shapes", () => {
    expect(detectImportFormat({ foo: "bar" })).toBeNull();
    expect(detectImportFormat(null)).toBeNull();
    expect(detectImportFormat([1, 2, 3])).toBeNull();
  });
});
