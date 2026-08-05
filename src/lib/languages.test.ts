import { describe, expect, it } from "vitest";
import { partitionLanguages } from "./languages";
import { Languages } from "@/schema/createCreatureSchema";

describe("partitionLanguages", () => {
  it("keeps known enum members as languages", () => {
    expect(partitionLanguages(["common", "draconic"])).toEqual({
      languages: [Languages.common, Languages.draconic],
      custom_languages: [],
    });
  });

  it("routes unknown strings to custom_languages", () => {
    expect(partitionLanguages(["Aquan", "telepathy 120 ft."])).toEqual({
      languages: [],
      custom_languages: ["Aquan", "telepathy 120 ft."],
    });
  });

  it("splits a mixed list and preserves order within each bucket", () => {
    expect(
      partitionLanguages(["common", "Aquan", "thieves-cant", "Primordial"]),
    ).toEqual({
      languages: [Languages.common, Languages["thieves-cant"]],
      custom_languages: ["Aquan", "Primordial"],
    });
  });

  it("matches case-sensitively — the enum values are all lowercase", () => {
    expect(partitionLanguages(["Common"])).toEqual({
      languages: [],
      custom_languages: ["Common"],
    });
  });

  it("returns empty buckets for an empty list", () => {
    expect(partitionLanguages([])).toEqual({
      languages: [],
      custom_languages: [],
    });
  });
});
