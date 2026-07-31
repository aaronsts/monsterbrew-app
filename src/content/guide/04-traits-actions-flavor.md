---
title: Traits, actions, and flavor
shortTitle: Traits & flavor
description: Writing 5e monster traits and actions that create decisions at the table, telegraph danger, and match the creature's concept.
---

Numbers make a monster fair; traits and actions will make it memorable. This chapter is about writing the part players actually experience, without drowning the person who has to run it.

## Abilities should create decisions

The best monster features change what players _do_, not just how fast their hit points drop. Before adding an ability, ask yourself: what decision does this force?

- A damaging aura makes melee characters weigh staying in against stepping out.
- A restraining grab turns the fight into a rescue problem.
- A creature that teleports when hit makes the party think about positioning instead of just attacking.
- Flat extra damage, by contrast, creates no decision at all. It's the least interesting way to spend budget.

A monster needs surprisingly few of these. Ideally, a battle lasts three to five rounds, so, as Teos Abadía advises for the 2024 rules, about **three actions is usually enough, and five is the ceiling**. One signature trait plus a Multiattack plus one alternative action outperforms a page of options you will never uses.

## Telegraph actions

An ability the players never saw coming reads as GM fiat; the same ability telegraphed a round earlier can be seen as a puzzle they failed to solve, or triumphantly did. Build the telegraph into the creature's description or into a low-cost behavior: the hag mutters the first line of a curse, the golem's runes flare before its overcharge, the swarm visibly thickens around the wounded.

> As my note earlier said, telegraphing that the dragon is about to use it's breath attack the round before and seeing my players thinking and panicking is amazing.

This is also the Lazy GM's advice for [lightning-rod encounters](/guide/common-pitfalls): if a threat is meant to be answered by a specific player capability (stun it, banish it, burn it down first), make sure the danger is readable enough that someone gets to have that idea.

## Match mechanics to concept

Every mechanical choice is a chance to restate what the creature is. Damage types are the easiest win: a creature channeling magic can deal acid, cold, fire, lightning, force, poison, psychic, necrotic, radiant, or thunder damage; one that's all spines and claws deals bludgeoning, piercing, or slashing. A grave-cold ghost that deals fire damage is telling the players nothing, or worse, the wrong thing.

The Lazy GM's Resource Document offers ten reusable, roughly pre-priced features worth knowing as a palette (CC-BY 4.0, paraphrased):

- **Damaging blast:** a single-target ranged attack at the creature's normal numbers.
- **Damaging burst:** a 10-foot-radius burst for half the creature's damage-per-round budget (half again on a successful save).
- **Damaging aura:** automatic damage for starting a turn within 10 feet, worth one of the creature's attacks.
- **Damage reflection:** melee attackers take half an attack's damage in return; costs the creature one attack.
- **Damage transference:** the creature shunts damage it takes onto a willing ally; excellent on bosses with minions.
- **Energy weapons:** extra typed damage riding on normal attacks.
- **Knockdown:** melee hits force a Strength save or knock prone.
- **Restraining grab:** melee hits grapple and restrain until escaped.
- **Misty step:** bonus-action 30-foot teleport.
- **Cunning action:** bonus-action Dash, Disengage, or Hide.

Pick the one or two that restate your concept sentence, price them out of the [damage budget](/guide/offense-defense), and stop.

## Write it so it runs itself

Statblock text is usually read during combat. Short sentences, standard phrasing, numbers up front. In Monsterbrew, insert attacks and saving throws with the Insert menu's **Attack line** and **Saving throw line** options, which render as complete rules lines computed from the creature's stats. Under the hood these are `{@…}` tags keyed to abilities rather than hard-coded numbers (`{@hit str}`, `{@dc con}`), so the text stays correct while you tune ability scores and CR, and the [editor](/editor)'s token inspector previews exactly what players will see.

Finally, give the creature one line of _behavior_: how it opens, what it protects, when it flees. "Fights until destroyed" is a choice, not a default. A monster that surrenders, bargains, or routs at half HP creates a scene; one that stands in place until it dies creates a subtraction problem.
