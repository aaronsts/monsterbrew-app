---
title: Offense and defense budgets
shortTitle: Offense & defense
description: Budgeting a 5e 2024 monster's damage output, multiattack, recharge abilities, and legendary actions and resistances against its CR.
---

Once you have a CR and its [benchmark row](/guide/challenge-rating), building the statblock becomes a budgeting exercise. The row gives you a damage-per-round allowance and a durability allowance; this chapter is about spending them well.

## Think in three-round budgets

The design math behind 5e monsters assumes a fight lasts about three rounds, with the monster using its best available option each round. "Damage per round" therefore means the *average* of the creature's best three rounds, not its opening nova. Practical consequences:

- A creature whose big ability is usable once (or on a recharge) can overspend on that round if its ordinary rounds come in under budget. Average the three rounds and aim the *average* at the benchmark.
- A breath weapon or burst that catches two or more characters counts double — budget multi-target damage at half the listed damage-per-round number.
- Damage that happens off-turn (auras that burn on approach, damage reflected onto attackers) is still damage. Count it in the budget, and pay for it by dropping an attack or trimming attack damage.

## Multiattack beats one big swing

At almost every CR above 1, the benchmark splits damage across several attacks — two by CR ½, three by CR 5, four by CR 10, five by CR 15. This isn't cosmetic. One huge attack is swingy in both directions: a miss wastes the monster's entire round (see [action economy](/guide/fundamentals)), and a hit can delete a character with no counterplay. Three medium attacks smooth the variance, let the monster split fire when it should, and keep every round eventful.

A good default shape: a Multiattack line spending most of the budget, plus one alternative action — a utility option or multi-target effect — for rounds when position or fiction calls for it. In Monsterbrew, write attacks with the `{@atkr m}` / `{@hit str}` / `{@damage 2d8 + str}` tokens so the attack recomputes if you retune the creature's abilities later; the [editor](/editor)'s token inspector shows the resolved numbers live.

## Recharge and limited-use abilities

Recharge abilities (the classic "Recharge 5–6") are permission to spike. Since the ability comes back on a 1-in-3 chance each round, a three-round fight sees it roughly twice — so its damage can run about double a normal round's budget if the creature's other rounds are lean. Recharge beats "1/day" for pacing: it keeps the threat alive all fight, and rolling the die in the open is its own little drama.

Give the spike a tell. A dragon that visibly draws breath, a construct whose core glows before venting — telegraphing lets players make decisions (scatter, shield, shove) rather than just absorb damage, which is the difference between a spike that's exciting and one that feels arbitrary.

## Saving-throw effects

For effects that force saves, the benchmark AC/DC column doubles as the save DC, and 8 + ability modifier + proficiency bonus should land in the same place if you build it up from scores. Two pieces of practical advice from Teos Abadía's 2024 process:

- Key every DC in the statblock to the creature's single most relevant ability where you can. One DC is easier to run and easier to read than three slightly different ones.
- Conditions are currency. An attack that also poisons, restrains, or knocks prone is worth more than its dice — pay for the rider with lower damage on that attack, or fewer attacks.

## Legendary monsters

A solo boss faces the whole party's action economy alone, and standard budgets aren't enough. Both Paul Hughes's 2024 Monster Manual analysis and the Lazy GM's material converge on the same guidance:

- **Damage**: legendary creatures (dragons especially) deal roughly **25% more damage** than the benchmark for their CR, without a matching HP increase.
- **Legendary actions** are the delivery mechanism: typically three per round, spent at the ends of other creatures' turns, chosen from two to four options. Cheap options (move, one attack) cost one action; big ones cost two or three. They're where the +25% lives, and they keep the boss present in every round of the fight instead of just its own.
- **Legendary resistance** (usually 3/day) exists so a boss isn't deleted by a single failed save against *banishment* or *hold monster*. Notably, the 2024 design no longer treats it as raising effective CR the way the 2014 DMG did — but it still changes how the fight plays, so mind the table experience: burning a resistance should feel like progress, and a boss who shrugs off everything stops being fun. Three is plenty.
- **Lair actions** (initiative 20) are a free way to add flavor-rich pressure that scales with the location rather than the statblock. If the lair action deals damage, it comes out of the same multi-target budget as everything else.

Reserve the full legendary package for creatures meant to headline a fight alone. A monster that will always appear with allies doesn't need it — and is cheaper to build without it.
