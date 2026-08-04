---
title: Challenge rating in practice
shortTitle: Challenge rating
description: How CR maps to AC, HP, attack bonus, save DC, and damage per round in D&D 5e 2024, with a full benchmark table for CR 0–30.
---

Challenge rating is the shorthand for "how hard is this monster?" that every other number depends on. The 2024 Dungeon Master's Guide, unlike its 2014 predecessor, ships no statistics-by-CR table for monster builders, so **the community** reverse-engineered one. In this chapter we go over these benchmarks and how to apply them.

## What CR actually predicts

A monster's CR is a promise about two things: how hard the creature is to put down (hit points, AC, saving throws; the editor's [Defense section](/editor#defense)) and how hard it hits back (attack bonus, save DC, damage per round; the [Combat](/editor#combat) and [Actions](/editor#actions) sections). The designers balance those against a party's expected capabilities, assuming a fight lasts about three rounds.

CR is _not_ a promise about how the fight feels. That comes from role, terrain, and action economy. Two CR 5 creatures can play completely differently. But if your homebrew creature's numbers drift far from its CR's benchmarks in both offense _and_ defense, players will definitely feel the mismatch.

## The benchmark table

The table below gives baseline statistics for every challenge rating, adapted from the [Lazy GM's 5e Monster Builder Resource Document](https://slyflourish.com/lazy_5e_monster_building_resource_document.html) by Teos Abadía, Scott Fitzgerald Gray, and Michael E. Shea (CC-BY 4.0). Two other statistical analyses of the 2024 Monster Manual, Paul Hughes's [on Blog of Holding](https://www.blogofholding.com/?p=8469) and Tom Dunn's [on The Finished Book](https://tomedunn.github.io/the-finished-book/monsters/monster-manual-2024/), confirm that these baselines follow the revised books closely up to about CR 16. Above that the published monsters drift away from the community numbers in a few ways, covered below.

A few notes on reading it:

- **AC/DC** is one number doing two jobs: the creature's typical Armor Class, and the typical save DC of its features. The two track each other up to about CR 16, then part ways. Save DCs keep climbing a point every two CRs, while published ACs slow to a point every three. Past CR 16, read the column as the save DC and set the Armor Class a couple of points lower.
- **Attack bonus** is the ability modifier and proficiency bonus _already added together_. Use it as the attack bonus and as the bonus for proficient saving throws and skills. Non-proficient abilities just get a modifier from −2 to +4 based on the creature's story.
- **Damage per round** is the creature's whole output for one round, split across its attacks. If an effect hits two or more characters at once, like a breath weapon or a burst, budget it at _half_ this number.
- **Equivalent level** is roughly the level of a single character for whom one such monster is a hard fight, so the table can double as an NPC builder.

<!--slot:cr-table-->

## The quick formulas

When you'd rather compute than look up, the same sources boil the table down to a handful of formulas (Lazy GM's Resource Document, CC-BY 4.0):

- **Armor Class** = 12 + half the creature's CR, good up to about CR 16. Beyond that, ACs go up by only a point every three CRs.
- **Hit points** = (15 × CR) + 15. Monsterbrew calculates hit points from Hit Dice: the creature's size sets the die and its Constitution adds to each one, so how many Hit Dice to give is up to you. Use this formula as the target to land near.
- **Attack bonus / proficient checks** = 4 + half the creature's CR
- **Save DC** = 12 + half the creature's CR
- **Damage per round** = (7 × CR) + 5
- Start with one attack, and add another at CR 2, 7, 11, and 15, splitting the damage budget across them.

Paul Hughes's analysis over the full 2024 Monster Manual lands on nearly identical curves (HP ≈ 15 + 15 per CR and damage ≈ 7.5 per CR through CR 20) and finds that 2024 monsters deal roughly **50% more damage** than their 2014 counterparts, with AC up about one point across the board. This is confirmed by Tom Dunn in [The Finished Book](https://tomedunn.github.io/the-finished-book/monsters/monster-manual-2024/), and he even adds a useful split: ordinary monsters average about 6 + 6 damage per CR, while legendary ones average 7.5 + 7.5. That gap is the legendary premium covered in the [next chapter](/guide/offense-defense). Above CR 20 both HP and damage accelerate sharply (roughly +50 HP and +12 to 15 damage per CR).

## Saves and initiative in 2024

Two findings from the revised books are easy to miss, and they both come from the same analyses.

First, saving throws, in 2024 monsters keep only **two or three proficient saves**, even at the highest CRs. Give the creature the two or three saves its concept justifies and leave the rest at plain ability modifiers.

Second, initiative. From the middle CRs on, most published monsters add their proficiency bonus to initiative, and every legendary monster adds double. Monsterbrew computes initiative from Dexterity, so use the Initiative field in the [Combat section](/editor#combat) when your creature should be quicker than its DEX suggests.

## When to deviate, and how to pay for it

These benchmarks are a baseline, you can deviate from them to express a creature role. The trick is to _trade_ and not stack:

- A glass-cannon artillery piece takes hit points from the bottom of its HP range and pushes damage above the line.
- A hulking defender does the opposite: trades HP for damage.
- Accuracy and defense trades work too: −2 AC in exchange for grappling on every hit, +2 to hit in exchange for having only one attack.
- Resistances, flight, regeneration, and at-will invisibility are all _defensive_ purchases. Pay for them with hit points or damage. A creature resistant to common damage types effectively has double its listed HP.

What ruins a monster is deviating in the same direction everywhere: above-benchmark HP _and_ AC _and_ damage is just a monster of a higher CR with the wrong label. If you find yourself doing that, raise the CR instead. The table is right there.

A useful cross-check from Teos Abadía's process: estimate a _defensive_ CR (which row does its effective HP and AC most resemble?) and an _offensive_ CR (which row matches its attack bonus and damage output?), then average the two. If that average isn't the CR you wrote down, adjust the statblock or the label until they agree.

Set the result in the editor's [Challenge Rating field](/editor#combat). Monsterbrew derives proficiency bonus and XP from it automatically, and any `{@hit}` or `{@dc}` tokens keyed to abilities recompute as you tune the statblock.
