import { describe, expect, it } from "vitest";
import { calculateHitPoints, formatMod, formatMovements } from "./utils";

describe("formatMod", () => {
  it("prefixes zero and positive modifiers with a plus", () => {
    expect(formatMod(0)).toBe("+0");
    expect(formatMod(3)).toBe("+3");
  });

  it("keeps the minus on negative modifiers", () => {
    expect(formatMod(-2)).toBe("-2");
  });
});

describe("formatMovements", () => {
  it("renders walk bare and other modes with a label", () => {
    expect(formatMovements({ walk: 30, swim: 20, fly: 60 })).toEqual([
      "30 ft.",
      "Swim 20 ft.",
      "Fly 60 ft.",
    ]);
  });

  it("marks the fly speed as hovering instead of listing hover", () => {
    expect(formatMovements({ walk: 30, fly: 60, hover: true })).toEqual([
      "30 ft.",
      "Fly 60 ft. (hover)",
    ]);
  });

  it("ignores hover without a fly speed and skips zero speeds", () => {
    expect(formatMovements({ walk: 30, fly: 0, hover: true })).toEqual([
      "30 ft.",
    ]);
  });
});

describe("calculateHitPoints", () => {
  it("appends a positive CON bonus", () => {
    expect(calculateHitPoints("2", "medium", 14)).toBe("13 (2d8 + 4)");
  });

  it("suppresses a zero CON bonus", () => {
    expect(calculateHitPoints("2", "medium", 10)).toBe("9 (2d8)");
  });

  it("renders a negative CON bonus with a minus", () => {
    expect(calculateHitPoints("2", "medium", 8)).toBe("7 (2d8 - 2)");
  });

  it("falls back to d4 for an unknown size", () => {
    expect(calculateHitPoints("2", "", 10)).toBe("5 (2d4)");
  });

  it("returns an empty string without a dice amount", () => {
    expect(calculateHitPoints("", "medium", 10)).toBe("");
  });
});
