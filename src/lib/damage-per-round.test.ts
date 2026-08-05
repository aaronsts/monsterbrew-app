import { describe, expect, it } from "vitest";
import { estimateDamagePerRound, featureDamage } from "./damage-per-round";
import type { DamageSource } from "./damage-per-round";
import type { MarkupContext } from "./statblock-markup";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { getSrdMonsters } from "@/services/srd";

/** STR 20 (+5), everything else 10 (+0). */
const ABILITY_SCORES: Monster["ability_scores"] = {
  ...defaultMonster.ability_scores,
  str: 20,
};

const cr5: Monster["cr"] = {
  ...defaultMonster.cr,
  challenge_rating: "5",
  proficiency_bonus: 3,
};

const ctx: MarkupContext = { ability_scores: ABILITY_SCORES, cr: cr5 };

function creature(overrides: Partial<DamageSource> = {}): DamageSource {
  return {
    ability_scores: ABILITY_SCORES,
    cr: cr5,
    name: "Test Beast",
    traits: [],
    actions: [],
    bonus_actions: [],
    reactions: [],
    is_legendary: false,
    legendary_actions: [],
    ...overrides,
  };
}

function feature(name: string, description: string) {
  return { name, description };
}

describe("featureDamage", () => {
  it("averages an attack's dice, resolving ability keywords", () => {
    // 2d8 (9) + 5 STR = 14.
    expect(featureDamage("{@attack m|str|5|2d8 + str|slashing}", ctx)).toBe(14);
  });

  it("adds the secondary damage rider", () => {
    // 2d8 + 5 (14) plus 3d6 (10).
    expect(
      featureDamage("{@attack m|str|5|2d8 + str|slashing|3d6|fire}", ctx),
    ).toBe(24);
  });

  it("counts a single-target save's failure damage in full", () => {
    // Every save fails under the measurement convention, so 6d6 is worth 21.
    expect(featureDamage("{@save dex|15|6d6|fire|half|one creature}", ctx)).toBe(
      21,
    );
  });

  it("halves a save that catches two or more characters", () => {
    // The benchmark budgets are per-character, so area damage counts half.
    expect(
      featureDamage("{@save dex|15|6d6|fire|half|each creature in a cone}", ctx),
    ).toBe(10);
  });

  it("counts damage tags nested in a save's failure text", () => {
    const bite =
      "{@save con|con||||one creature|{@damage 1d4 + 4} Piercing damage plus {@damage 3d8} Necrotic damage}";
    expect(featureDamage(bite, ctx)).toBe(6 + 13);
  });

  it("counts damage tags nested in an attack's effect slot", () => {
    // Where prose-to-tags puts an imported attack's rider damage.
    const bite =
      "{@attack m|str|5|1d10 + 1|piercing||| the target takes {@damage 2d6} Poison damage}";
    expect(featureDamage(bite, ctx)).toBe(6 + 7);
  });

  it("ignores loose damage tags that ride alongside an attack", () => {
    // The Mummy pattern: the curse drains Hit Points every 24 hours, which is
    // not part of the round's output.
    const rottingFist =
      "{@attack m|str|5|1d10 + 3|bludgeoning|3d6|necrotic} While cursed, its Hit Point maximum decreases by {@damage 3d6} every 24 hours.";
    expect(featureDamage(rottingFist, ctx)).toBe(8 + 10);
  });

  it("counts a loose damage tag that is part of the round", () => {
    // Extra damage written outside the composite tag is still damage; only
    // the rider wording above takes it out of the round.
    const searing =
      "{@save dex|15|6d6|fire|half|one creature} On a failed save the target also takes {@damage 3d6} Necrotic damage.";
    expect(featureDamage(searing, ctx)).toBe(21 + 10);
  });

  it("falls back to loose damage tags when there is no composite tag", () => {
    // The atomic route prose-to-tags takes for 2014-style statblocks.
    const atomic = "{@atkr m} {@hit str}, reach 5 ft. {@h}{@damage 2d8 + str} slashing damage.";
    expect(featureDamage(atomic, ctx)).toBe(14);
  });

  it("is zero for prose with no tags", () => {
    expect(featureDamage("The beast howls menacingly.", ctx)).toBe(0);
  });
});

describe("estimateDamagePerRound", () => {
  const claw = feature("Claw", "{@attack m|str|5|2d6 + str|slashing}"); // 12
  const bite = feature("Bite", "{@attack m|str|5|2d10 + str|piercing}"); // 16

  it("returns null when nothing carries a damage tag", () => {
    expect(estimateDamagePerRound(creature())).toBeNull();
    expect(
      estimateDamagePerRound(
        creature({ actions: [feature("Howl", "It howls. Everyone hears it.")] }),
      ),
    ).toBeNull();
  });

  it("uses the best single action when there is no Multiattack", () => {
    const estimate = estimateDamagePerRound(creature({ actions: [claw, bite] }));
    expect(estimate?.total).toBe(16);
    expect(estimate?.turn).toEqual([{ name: "Bite", count: 1, damage: 16 }]);
  });

  it("expands `makes two Claw attacks`", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two Claw attacks."),
          claw,
        ],
      }),
    );
    expect(estimate?.total).toBe(24);
    expect(estimate?.turn).toEqual([{ name: "Claw", count: 2, damage: 12 }]);
  });

  it("takes the best option in `two Claw or Bite attacks`", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two Claw or Bite attacks."),
          claw,
          bite,
        ],
      }),
    );
    expect(estimate?.total).toBe(32); // 2 × Bite, the harder hitter
  });

  it("expands `three attacks, using Claw or Bite in any combination`", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature(
            "Multiattack",
            "The beast makes three attacks, using Claw or Bite in any combination.",
          ),
          claw,
          bite,
        ],
      }),
    );
    expect(estimate?.total).toBe(48);
  });

  it("adds an action the Multiattack `uses` by name", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature(
            "Multiattack",
            "The beast makes two Claw attacks and uses Searing Gaze.",
          ),
          claw,
          feature("Searing Gaze", "{@save dex|15|4d6|radiant|half|one creature}"),
        ],
      }),
    );
    expect(estimate?.total).toBe(24 + 14);
  });

  it("prefers a single big action over a weaker Multiattack", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two Claw attacks."),
          claw,
          feature("Crush", "{@save str|15|8d6|bludgeoning|half|one creature}"),
        ],
      }),
    );
    expect(estimate?.total).toBe(28);
    expect(estimate?.turn).toEqual([{ name: "Crush", count: 1, damage: 28 }]);
  });

  it("keeps a recharge action out of the every-round total", () => {
    // 12d6 halved for the cone is still 21, which would beat two Claws — but
    // a breath weapon is not what the creature does round after round.
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two Claw attacks."),
          claw,
          feature(
            "Fire Breath (Recharge 5-6)",
            "{@save dex|15|12d6|fire|half|each creature in a cone}",
          ),
        ],
      }),
    );
    expect(estimate?.turn).toEqual([{ name: "Claw", count: 2, damage: 12 }]);
  });

  it("still reads a recharge action that is the only damage there is", () => {
    // Overstating the round beats reporting a creature as dealing nothing.
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature(
            "Fire Breath (Recharge 5-6)",
            "{@save dex|15|12d6|fire|half|one creature}",
          ),
        ],
      }),
    );
    expect(estimate?.total).toBe(42);
  });

  it("keeps the harder hitter when two actions share a name", () => {
    // A shapechanger's two Bites normalize to the same lookup key.
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two Bite attacks."),
          feature("Bite (Humanoid Form Only)", "{@attack m|str|5|1d6 + str|piercing}"), // 8
          feature("Bite (Beast Form Only)", "{@attack m|str|5|2d10 + str|piercing}"), // 16
        ],
      }),
    );
    expect(estimate?.turn).toEqual([
      { name: "Bite (Beast Form Only)", count: 2, damage: 16 },
    ]);
  });

  it("repeats the best attack for `makes two attacks` with nothing named", () => {
    // The wording of the editor's own Multiattack preset.
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The {@mon} makes two attacks."),
          claw,
          bite,
        ],
      }),
    );
    expect(estimate?.total).toBe(32); // 2 × Bite
  });

  it("reads an unnamed count as swings, not as the biggest area action", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          feature("Multiattack", "The beast makes two attacks."),
          claw,
          feature("Breath", "{@save dex|15|5d6|fire|half|each creature in a cone}"),
        ],
      }),
    );
    // 2 × Claw (24) beats the single 17-damage breath, and the breath is not
    // itself something the creature "makes two of".
    expect(estimate?.turn).toEqual([{ name: "Claw", count: 2, damage: 12 }]);
  });

  it("finds a Multiattack filed as a trait", () => {
    // Where the editor's preset picker puts it.
    const estimate = estimateDamagePerRound(
      creature({
        traits: [feature("Multiattack", "The {@mon} makes two attacks.")],
        actions: [claw],
      }),
    );
    expect(estimate?.total).toBe(24);
  });

  it("never counts trait damage itself", () => {
    // A damaging trait is passive or conditional, not part of a normal round.
    const estimate = estimateDamagePerRound(
      creature({
        traits: [
          feature("Fire Aura", "{@save dex|15|9d6|fire|half|each creature}"),
        ],
        actions: [claw],
      }),
    );
    expect(estimate?.total).toBe(12);
  });

  it("falls back to the best action when the Multiattack is unreadable", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [
          // The Hydra's phrasing, which has no countable number.
          feature(
            "Multiattack",
            "The hydra makes as many Bite attacks as it has heads.",
          ),
          bite,
        ],
      }),
    );
    expect(estimate?.total).toBe(16);
  });

  it("adds the best bonus action to the turn", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [claw],
        bonus_actions: [
          feature("Nimble Escape", "It takes the Disengage action."), // 0
          feature("Tail Sting", "{@attack m|str|5|1d6 + str|piercing}"), // 8
        ],
      }),
    );
    expect(estimate?.total).toBe(12 + 8);
    expect(estimate?.turn).toEqual([
      { name: "Claw", count: 1, damage: 12 },
      { name: "Tail Sting", count: 1, damage: 8 },
    ]);
  });

  it("counts one reaction per round as off-turn damage", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [claw],
        reactions: [
          feature("Spiked Hide", "{@damage 2d6} Piercing damage to the attacker."),
        ],
      }),
    );
    expect(estimate?.total).toBe(12 + 7);
    expect(estimate?.offTurn).toEqual([
      { name: "Spiked Hide", count: 1, damage: 7 },
    ]);
  });

  it("resolves a bonus action or reaction that names an action", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [claw, bite],
        bonus_actions: [feature("Quick Bite", "The beast makes one Bite attack.")],
        reactions: [
          feature("Opportune Swipe", "The beast makes one Claw attack."),
        ],
      }),
    );
    // Bite on the turn (16) + Quick Bite (16), Opportune Swipe off-turn (12).
    expect(estimate?.total).toBe(16 + 16 + 12);
    expect(estimate?.offTurn).toEqual([
      { name: "Opportune Swipe", count: 1, damage: 12 },
    ]);
  });

  it("ignores bonus actions and reactions that deal no damage", () => {
    const estimate = estimateDamagePerRound(
      creature({
        actions: [claw],
        bonus_actions: [feature("Shift", "It moves half its Speed.")],
        reactions: [feature("Parry", "It adds 2 to its AC against one attack.")],
      }),
    );
    expect(estimate?.total).toBe(12);
    expect(estimate?.offTurn).toEqual([]);
  });

  it("ignores legendary actions unless the creature is legendary", () => {
    const actions = [claw];
    const legendary_actions = [
      feature("Pounce", "The beast moves and makes one Claw attack."),
    ];
    expect(
      estimateDamagePerRound(creature({ actions, legendary_actions }))?.total,
    ).toBe(12);
    expect(
      estimateDamagePerRound(
        creature({ actions, legendary_actions, is_legendary: true }),
      )?.total,
    ).toBe(12 + 3 * 12);
  });

  it("spends the three legendary uses on the best mix of options", () => {
    const estimate = estimateDamagePerRound(
      creature({
        is_legendary: true,
        actions: [claw],
        legendary_actions: [
          feature("Pounce", "The beast moves and makes one Claw attack."), // 12, repeatable
          feature(
            "Wailing Blast",
            "{@save con|15|8d6|thunder|half|one creature} The beast can't take this action again until the start of its next turn.",
          ), // 28, once per round
        ],
      }),
    );
    // One blast (28) plus two pounces (24), not three pounces (36).
    expect(estimate?.total).toBe(12 + 28 + 24);
    expect(estimate?.legendary).toEqual([
      { name: "Wailing Blast", count: 1, damage: 28 },
      { name: "Pounce", count: 2, damage: 12 },
    ]);
  });

  it("prices a legendary option that costs more than one action", () => {
    // 2014-era imports put the cost in the name. Three uses buy one Wing
    // Attack (2 each) plus one Pounce (1), not three Wing Attacks.
    const estimate = estimateDamagePerRound(
      creature({
        is_legendary: true,
        actions: [
          claw,
          feature("Crush", "{@attack m|str|5|8d6 + str|bludgeoning}"), // 33
        ],
        legendary_actions: [
          feature("Pounce", "The beast makes one Claw attack."), // 12, cost 1
          feature(
            "Wing Attack (Costs 2 Actions)",
            "The beast makes one Crush attack.",
          ), // 33, cost 2
        ],
      }),
    );
    expect(estimate?.legendary).toEqual([
      { name: "Wing Attack (Costs 2 Actions)", count: 1, damage: 33 },
      { name: "Pounce", count: 1, damage: 12 },
    ]);
  });
});

describe("estimateDamagePerRound over the SRD bestiary", () => {
  const srd = getSrdMonsters().map((entry) => entry.monster);
  const byName = (name: string) => {
    const monster = srd.find((m) => m.name === name);
    expect(monster, `${name} missing from the SRD data`).toBeTruthy();
    return estimateDamagePerRound(monster!);
  };

  it("reads the Aboleth's Multiattack", () => {
    // Two Tentacle attacks (2d6 + 5 = 12 each) plus Consume Memories (3d6).
    expect(byName("Aboleth")?.turn).toEqual([
      { name: "Tentacle", count: 2, damage: 12 },
      { name: "Consume Memories", count: 1, damage: 10 },
    ]);
  });

  it("resolves a legendary action that references an action by name", () => {
    // Rend is 2d8 + 10 slashing plus 3d6 fire = 29; Pounce makes one, ×3 uses.
    const estimate = byName("Ancient Red Dragon");
    expect(estimate?.legendary).toEqual([
      { name: "Pounce", count: 3, damage: 29 },
    ]);
    // Three Rends, not Fire Breath: it recharges, so it doesn't set the round.
    expect(estimate?.total).toBe(87 + 87);
  });

  it("produces a damage estimate for nearly every SRD monster", () => {
    const unreadable = srd.filter((m) => estimateDamagePerRound(m) === null);
    // A handful of CR 0 critters have no damaging action at all. Asserted as a
    // ceiling so regenerating the SRD data can't redden an estimator test.
    expect(unreadable.length).toBeLessThan(6);
    expect(unreadable.map((m) => m.name)).toContain("Shrieker Fungus");
  });
});
