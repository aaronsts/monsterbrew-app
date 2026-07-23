import { describe, expect, it } from "vitest";
import {
  parseAttackArgs,
  parseMarkup,
  parseSaveArgs,
  resolveMarkup,
  serializeAttackArgs,
  serializeSaveArgs,
  validateAttackArgs,
  validateSaveArgs,
} from "./statblock-markup";
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
      { type: "text", value: "a ", start: 0, end: 2 },
      {
        type: "tag",
        name: "hit",
        args: "str",
        raw: "{@hit str}",
        start: 2,
        end: 12,
      },
      { type: "text", value: " b", start: 12, end: 14 },
    ]);
  });

  it("handles argument-less tags", () => {
    expect(parseMarkup("{@h}")).toEqual([
      { type: "tag", name: "h", args: "", raw: "{@h}", start: 0, end: 4 },
    ]);
  });

  it("gives every segment offsets that reconstruct the source", () => {
    const source = "before {@hit str}, mid {@damage 2d8 + str} after";
    const segs = parseMarkup(source);
    expect(segs.map((s) => source.slice(s.start, s.end)).join("")).toBe(source);
  });

  it("disambiguates identical tags by offset", () => {
    const twice = "{@hit str} and {@hit str}";
    const tags = parseMarkup(twice).filter((s) => s.type === "tag");
    expect(tags).toHaveLength(2);
    expect(tags[0].start).toBe(0);
    expect(tags[1].start).toBe(15);
    expect(twice.slice(tags[1].start, tags[1].end)).toBe("{@hit str}");
  });

  it("parses a tag whose args contain a nested tag", () => {
    const source = "{@save dex|con|3d6|fire|the target is {@condition prone}}";
    const segs = parseMarkup(source);
    expect(segs).toHaveLength(1);
    const tag = segs[0];
    expect(tag.type).toBe("tag");
    if (tag.type === "tag") {
      expect(tag.name).toBe("save");
      expect(tag.args).toBe(
        "dex|con|3d6|fire|the target is {@condition prone}",
      );
      expect(tag.end).toBe(source.length);
    }
  });

  it("treats unbalanced braces as plain text", () => {
    expect(parseMarkup("take {@hit str damage")).toEqual([
      { type: "text", value: "take {@hit str damage", start: 0, end: 21 },
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

  it("tidies the sign when a linked ability modifier is negative or zero", () => {
    // CHA 8 -> -1 mod: "2d6 + cha" should read "2d6 - 1", not "2d6 + -1".
    expect(render("{@damage 2d6 + cha}")).toBe("6 (2d6 - 1)"); // 7 - 1
    // INT 10 -> +0 mod: the term drops out entirely.
    expect(render("{@damage 2d6 + int}")).toBe("7 (2d6)");
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
    expect(render("{@recharge 4}")).toBe("(Recharge 4–6)");
    expect(render("{@recharge 5}")).toBe("(Recharge 5–6)");
    expect(render("{@recharge 6}")).toBe("(Recharge 6)");
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

describe("resolveMarkup — {@attack} composite", () => {
  it("renders a full melee attack line", () => {
    expect(render("{@attack m|str|5|2d8+str|slashing}")).toBe(
      "Melee Attack Roll: +9, reach 5 ft. Hit: 14 (2d8 + 5) Slashing damage.",
    );
  });

  it("renders a ranged attack with normal/long range", () => {
    expect(render("{@attack r|dex|30/120|1d8+dex|piercing}")).toBe(
      "Ranged Attack Roll: +6, range 30/120 ft. Hit: 6 (1d8 + 2) Piercing damage.",
    );
  });

  it("renders a melee-or-ranged attack with both distances", () => {
    expect(render("{@attack m,r|str|5;20/60|1d6+str|piercing}")).toBe(
      "Melee or Ranged Attack Roll: +9, reach 5 ft. or range 20/60 ft. Hit: 8 (1d6 + 5) Piercing damage.",
    );
  });

  it("accepts a flat hit bonus and flat dice", () => {
    expect(render("{@attack m|3|5|2d8+1|acid}")).toBe(
      "Melee Attack Roll: +3, reach 5 ft. Hit: 10 (2d8 + 1) Acid damage.",
    );
  });

  it("drops the reach clause when reach is omitted", () => {
    expect(render("{@attack m|str||2d8+str|slashing}")).toBe(
      "Melee Attack Roll: +9. Hit: 14 (2d8 + 5) Slashing damage.",
    );
  });

  it("drops the Hit clause when dice are omitted", () => {
    expect(render("{@attack m|str|5}")).toBe(
      "Melee Attack Roll: +9, reach 5 ft.",
    );
  });

  it("renders untyped damage when type is omitted", () => {
    expect(render("{@attack m|str|5|2d8+str}")).toBe(
      "Melee Attack Roll: +9, reach 5 ft. Hit: 14 (2d8 + 5) damage.",
    );
  });

  it("never throws on malformed args", () => {
    expect(render("{@attack}")).toBe("{@attack}");
    expect(render("{@attack |||}")).toBe("Melee Attack Roll:");
    expect(render("{@attack q|banana}")).toBe("Melee Attack Roll: +0.");
  });
});

describe("resolveMarkup — {@save} composite", () => {
  it("renders a full line, defaulting to a half-damage success clause", () => {
    // onSave omitted but dice present -> defaults to half.
    expect(render("{@save dex|con|3d6|fire}")).toBe(
      "Dexterity Saving Throw: DC 15. Failure: 10 (3d6) Fire damage. Success: Half damage.",
    );
  });

  it("accepts a flat DC and honours onSave=none", () => {
    expect(render("{@save con|15|8d8|poison|none}")).toBe(
      "Constitution Saving Throw: DC 15. Failure: 36 (8d8) Poison damage.",
    );
  });

  it("renders custom success text, resolving nested tags", () => {
    expect(
      render("{@save str|con|||the target is {@condition prone|XPHB}}"),
    ).toBe("Strength Saving Throw: DC 15. Success: the target is prone.");
  });

  it("drops the damage clause without dice and never throws when malformed", () => {
    expect(render("{@save dex|con}")).toBe("Dexterity Saving Throw: DC 15.");
    expect(render("{@save}")).toBe("{@save}");
  });
});

describe("resolveMarkup — {@damage} with optional type", () => {
  it("appends a capitalized damage type after a pipe", () => {
    expect(render("{@damage 1d6|fire}")).toBe("3 (1d6) Fire damage");
    expect(render("{@damage 2d8 + str|slashing}")).toBe(
      "14 (2d8 + 5) Slashing damage",
    );
  });
});

describe("composite grammar round-trip", () => {
  it.each([
    "m|str|5|2d8+str|slashing",
    "m|str||1d6+str",
    "m|str||1d6+str|",
    "r|4|30/120",
    "m,r|str|5;20/60|1d6+str|piercing",
  ])("serializeAttackArgs(parseAttackArgs(%j)) is idempotent", (args) => {
    const once = serializeAttackArgs(parseAttackArgs(args));
    expect(serializeAttackArgs(parseAttackArgs(once))).toBe(once);
  });

  it.each([
    "dex|con|3d6|fire|half",
    "dex|con|3d6|fire",
    "con|15|8d8|poison|none",
    "str|con|||the target is {@condition prone}",
  ])("serializeSaveArgs(parseSaveArgs(%j)) is idempotent", (args) => {
    const once = serializeSaveArgs(parseSaveArgs(args));
    expect(serializeSaveArgs(parseSaveArgs(once))).toBe(once);
  });

  it("preserves nested-tag custom text through the save round-trip", () => {
    const fields = parseSaveArgs(
      "dex|con|3d6|fire|the target is {@condition prone}",
    );
    expect(fields.onSave).toBe("the target is {@condition prone}");
    expect(serializeSaveArgs(fields)).toBe(
      "dex|con|3d6|fire|the target is {@condition prone}",
    );
  });
});

describe("composite validation (editor diagnostics)", () => {
  it("accepts well-formed attack and save args", () => {
    expect(validateAttackArgs("m|str|5|2d8+str|slashing")).toEqual([]);
    expect(validateAttackArgs("m,r|4|5;20/60")).toEqual([]);
    expect(validateSaveArgs("dex|con|3d6|fire|half")).toEqual([]);
    expect(validateSaveArgs("con|15")).toEqual([]);
  });

  it("flags missing or malformed attack slots", () => {
    expect(validateAttackArgs("")).toHaveLength(2); // kind + hit missing
    expect(validateAttackArgs("q|str").join()).toContain(
      'unknown attack kind "q"',
    );
    expect(validateAttackArgs("m|banana").join()).toContain(
      'to-hit "banana" is neither an ability nor a number',
    );
  });

  it("flags missing or malformed save slots", () => {
    expect(validateSaveArgs("")).toHaveLength(2); // ability + dc missing
    expect(validateSaveArgs("luck|con").join()).toContain(
      'unknown ability "luck"',
    );
    expect(validateSaveArgs("dex|banana").join()).toContain(
      'DC "banana" is neither an ability nor a number',
    );
  });
});
