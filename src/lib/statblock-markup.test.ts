import { describe, expect, it } from "vitest";
import { parseMarkup, resolveMarkup } from "./statblock-markup";
import type { MarkupContext } from "./statblock-markup";

/** STR 20 (+5), DEX 14 (+2), CON 16 (+3), PB +4. */
const ctx: MarkupContext = {
  ability_scores: { str: 20, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
  cr: {
    challenge_rating: "5",
    proficiency_bonus: 4,
    hit_points_range: "",
    attack_bonus: 0,
    damage_per_round: "",
    save_dc: 0,
    experience: 0,
    armor_class: 0,
  },
};

const render = (text: string) => resolveMarkup(text, ctx);

describe("parseMarkup", () => {
  it("splits text and tags", () => {
    const segs = parseMarkup("a {@hit str} b");
    expect(segs).toEqual([
      { type: "text", value: "a " },
      { type: "tag", name: "hit", args: "str", raw: "{@hit str}" },
      { type: "text", value: " b" },
    ]);
  });

  it("handles argument-less tags", () => {
    expect(parseMarkup("{@h}")).toEqual([
      { type: "tag", name: "h", args: "", raw: "{@h}" },
    ]);
  });
});

describe("resolveMarkup — plain text", () => {
  it("passes through descriptions with no tags", () => {
    expect(render("The ooze moves through cracks.")).toBe(
      "The ooze moves through cracks.",
    );
  });
});

describe("resolveMarkup — attack rolls", () => {
  it("maps 2024 attack-roll kinds", () => {
    expect(render("{@atkr m}")).toBe("Melee Attack Roll:");
    expect(render("{@atkr r}")).toBe("Ranged Attack Roll:");
    expect(render("{@atkr m,r}")).toBe("Melee or Ranged Attack Roll:");
  });

  it("maps 2014 legacy weapon/spell attacks", () => {
    expect(render("{@atk mw}")).toBe("Melee Weapon Attack:");
    expect(render("{@atk rs}")).toBe("Ranged Spell Attack:");
  });
});

describe("resolveMarkup — to-hit", () => {
  it("keeps a flat numeric bonus (5eTools import)", () => {
    expect(render("{@hit 3}")).toBe("+3");
    expect(render("{@hit 19}")).toBe("+19");
  });

  it("derives an ability-linked bonus from mod + PB", () => {
    expect(render("{@hit str}")).toBe("+9"); // +5 STR + 4 PB
    expect(render("{@hit cha}")).toBe("+3"); // -1 CHA + 4 PB
  });

  it("recomputes when the ability score changes", () => {
    const weaker: MarkupContext = {
      ...ctx,
      ability_scores: { ...ctx.ability_scores, str: 10 },
    };
    expect(resolveMarkup("{@hit str}", weaker)).toBe("+4"); // +0 + 4 PB
  });
});

describe("resolveMarkup — save DC", () => {
  it("keeps a flat DC", () => {
    expect(render("{@dc 15}")).toBe("DC 15");
  });

  it("derives DC from 8 + PB + ability mod", () => {
    expect(render("{@dc con}")).toBe("DC 15"); // 8 + 4 + 3
  });
});

describe("resolveMarkup — damage", () => {
  it("prepends the computed average to the dice", () => {
    expect(render("{@damage 2d8 + 1}")).toBe("10 (2d8 + 1)");
    expect(render("{@damage 4d12 + 10}")).toBe("36 (4d12 + 10)");
    expect(render("{@damage 12d12}")).toBe("78 (12d12)");
  });

  it("resolves an ability keyword inside the dice expression", () => {
    expect(render("{@damage 2d8 + str}")).toBe("14 (2d8 + 5)"); // 9 + 5
  });

  it("strips 5eTools' redundant literal average around the tag", () => {
    expect(render("{@h}10 ({@damage 2d8 + 1}) Acid damage.")).toBe(
      "Hit: 10 (2d8 + 1) Acid damage.",
    );
  });
});

describe("resolveMarkup — saves, recharge, dice", () => {
  it("renders 2024 save prompts and outcomes", () => {
    expect(render("{@actSave dex}")).toBe("Dexterity Saving Throw:");
    expect(render("{@actSaveFail}")).toBe("Failure:");
    expect(render("{@actSaveSuccess}")).toBe("Success:");
  });

  it("renders recharge ranges", () => {
    expect(render("{@recharge 5}")).toBe("(Recharge 5–6)");
    expect(render("{@recharge}")).toBe("(Recharge 6)");
  });

  it("renders inline dice without an average", () => {
    expect(render("regains {@dice 1d6} hit points")).toBe(
      "regains 1d6 hit points",
    );
  });
});

describe("resolveMarkup — reference tags", () => {
  it("keeps the label and drops the |SOURCE", () => {
    expect(render("cast {@spell Mending|XPHB} on it")).toBe("cast Mending on it");
    expect(render("becomes {@condition prone}")).toBe("becomes prone");
  });

  it("honours an explicit display override", () => {
    expect(render("{@spell fireball|XPHB|a fireball}")).toBe("a fireball");
  });
});

describe("resolveMarkup — robustness", () => {
  it("never leaks braces for unknown tags and never throws", () => {
    expect(render("{@unknownTag some text}")).toBe("some text");
    expect(render("{@weird}")).toBe("{@weird}");
  });

  it("resolves a full imported action into clean prose", () => {
    const pseudopod =
      "{@atkr m} {@hit 3}, reach 5 ft. {@h}10 ({@damage 2d8 + 1}) Acid damage. " +
      "The armor is destroyed if the penalty reduces its AC to 10. The penalty " +
      "can be removed by casting the {@spell Mending|XPHB} spell on the armor.";
    const out = render(pseudopod);
    expect(out).not.toContain("{@");
    expect(out).toContain("Melee Attack Roll: +3, reach 5 ft. Hit: 10 (2d8 + 1) Acid damage.");
    expect(out).toContain("casting the Mending spell");
  });
});
