import { CHALLENGE_RATINGS } from "@/lib/constants";
import { calculateStatBonus, titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { z } from "zod";

export function createMarkdownPage(
  creature: z.infer<typeof createCreatureSchema>
) {
  const markdownWindow = window.open();
  const markdown = [
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>',
    creature.name,
    '</title><link rel="shortcut icon" type="image/x-icon" href="./dndimages/favicon.ico" /></head><body>',
  ];
  markdown.push("<h2>Homebrewery V3</h2>", generateMarkdown(creature));
  markdown.push("</body></html>");
  markdownWindow!.document.write(markdown.join(""));
}

function generateMarkdown(creature: z.infer<typeof createCreatureSchema>) {
  const markdownLines: string[] = [];

  const movements: string[] = [];
  Object.entries(creature.movements).forEach((m) => {
    const hover = creature.movements.hover;
    if (!!m[1]) {
      switch (m[0]) {
        case "walk":
          movements.push(`${m[1]} ft.`);
          break;
        case "fly":
          return !!hover
            ? movements.push(`${m[0]} ${m[1]} ft. (hover)`)
            : movements.push(`${m[0]} ${m[1]} ft.`);
        case "hover":
          break;
        default:
          movements.push(`${m[0]} ${m[1]} ft.`);
          break;
      }
    }
  });

  markdownLines.push(`{{monster,frame,wide`);
  markdownLines.push(
    `## ${creature.name}`,
    `*${titleCase(creature.size)} ${creature.type}, ${creature.alignment}*`,
    `___`,
    `**Armor Class** :: ${creature.armor_class} (${creature.armor_description})`,
    `**Hit Points** :: ${creature.hit_points} (${creature.hit_dice})`,
    `**Speed** :: ${movements.join(", ")}`,
    `___`
  );
  markdownLines.push(
    `|STR|DEX|CON|INT|WIS|CHA|`,
    `|:---:|:---:|:---:|:---:|:---:|:---:|`,
    `|${creature.ability_scores.str} ${calculateStatBonus(
      creature.ability_scores.str
    )}|` +
      `${creature.ability_scores.dex} ${calculateStatBonus(
        creature.ability_scores.dex
      )}|` +
      `${creature.ability_scores.con} ${calculateStatBonus(
        creature.ability_scores.con
      )}|` +
      `${creature.ability_scores.int} ${calculateStatBonus(
        creature.ability_scores.int
      )}|` +
      `${creature.ability_scores.wis} ${calculateStatBonus(
        creature.ability_scores.wis
      )}|` +
      `${creature.ability_scores.cha} ${calculateStatBonus(
        creature.ability_scores.cha
      )}|`
  );
  markdownLines.push("___");

  const cr = CHALLENGE_RATINGS.find(
    (r) => r.challenge_rating === creature.challenge_rating
  );

  const savingThrows: string[] = creature.saving_throws
    ? creature.saving_throws?.map(
        (save: keyof typeof creature.ability_scores) => {
          const bonus =
            Math.floor(
              creature.ability_scores[
                save as keyof typeof creature.ability_scores
              ] / 2
            ) -
            5 +
            (cr?.proficiency_bonus || 0);
          return `${titleCase(save.slice(0, 3))} +${bonus <= 0 ? 0 : bonus}`;
        }
      )
    : [];

  if (savingThrows.length > 0)
    markdownLines.push(`**Saving Throws** :: ${savingThrows.join(", ")}`);

  const skills = creature.skill_bonuses.map((skl) => {
    const bonus = Math.floor(
      creature.ability_scores[
        skl.skill_modifier as keyof typeof creature.ability_scores
      ] /
        2 -
        5
    );
    const profBonus = skl.is_expert
      ? (cr?.proficiency_bonus || 1) * 2
      : cr?.proficiency_bonus || 0;
    return `${titleCase(skl.skill_name)} +${profBonus + bonus}`;
  });

  markdownLines.push(`**Skills** :: ${titleCase(skills.join(", "))}`);

  if (creature.damage_immunities)
    markdownLines.push(
      `**Damage Immunities** :: ${creature.damage_immunities}`
    );

  if (creature.damage_resistances)
    markdownLines.push(
      `**Damage Resistances** :: ${creature.damage_resistances}`
    );

  if (creature.damage_vulnerabilities)
    markdownLines.push(
      `**Damage Vulnerabilities** :: ${creature.damage_vulnerabilities}`
    );

  // if (creature.condition_immunities)
  //   markdownLines.push(
  //     `**Condition Immunities** :: ${creature.condition_immunities}`
  //   );
  const senses: string[] = [];
  if (creature.senses) {
    Object.entries(creature.senses).forEach((m) => {
      const isBlindBeyond = creature.senses?.is_blind_beyond;
      if (!!m[1]) {
        switch (m[0]) {
          case "blindsight":
            return !!isBlindBeyond
              ? senses.push(`${m[0]} ${m[1]} ft. (blind beyond this radius)`)
              : senses.push(`${m[0]} ${m[1]} ft.`);
          case "is_blind_beyond":
            break;
          default:
            senses.push(`${m[0]} ${m[1]} ft.`);
            break;
        }
      }
    });
  }

  markdownLines.push(`**Senses** :: ${senses.join(", ")}`);

  if (creature.languages)
    markdownLines.push(`**Languages** :: ${creature.languages?.join(", ")}`);

  markdownLines.push(
    `**Challenge** :: ${cr?.challenge_rating} (${cr?.experience} XP)`,
    "___"
  );

  // creature.special_abilities?.forEach((ability, i) => {
  //   i === creature.special_abilities!.length - 1
  //     ? markdownLines.push(`${capitalize(ability.name)}. ${ability.desc}`)
  //     : markdownLines.push(`${capitalize(ability.name)}. ${ability.desc}`, ":");
  // });

  // if (creature.actions && creature.actions.length > 0) {
  //   markdownLines.push("### Actions");
  //   creature.actions.forEach((action, i) => {
  //     i === creature.actions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }

  // if (creature.reactions && creature.reactions.length > 0) {
  //   markdownLines.push("### Reactions");
  //   creature.reactions.forEach((action, i) => {
  //     i === creature.reactions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }

  // if (creature.legendary_actions && creature.legendary_actions.length > 0) {
  //   markdownLines.push(
  //     "### Legendary Actions",
  //     creature.legendary_desc ? creature.legendary_desc : "",
  //     ":"
  //   );
  //   creature.legendary_actions.forEach((action, i) => {
  //     i === creature.legendary_actions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }

  // if (creature.lair_actions && creature.lair_actions.length > 0) {
  //   markdownLines.push(
  //     "### Lair Actions",
  //     creature.lair_desc ? creature.lair_desc : "",
  //     ":"
  //   );
  //   creature.lair_actions.forEach((action, i) => {
  //     i === creature.lair_actions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }
  // if (creature.mythic_actions && creature.mythic_actions.length > 0) {
  //   markdownLines.push(
  //     "### Mythic Actions",
  //     creature.lair_desc ? creature.lair_desc : "",
  //     ":"
  //   );
  //   creature.mythic_actions.forEach((action, i) => {
  //     i === creature.mythic_actions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }
  // if (creature.regional_actions && creature.regional_actions.length > 0) {
  //   markdownLines.push(
  //     "### Regional Effects",
  //     creature.lair_desc ? creature.lair_desc : "",
  //     ":"
  //   );
  //   creature.regional_actions.forEach((action, i) => {
  //     i === creature.regional_actions!.length - 1
  //       ? markdownLines.push(`${capitalize(action.name)}. ${action.desc}`)
  //       : markdownLines.push(`${capitalize(action.name)}. ${action.desc}`, ":");
  //   });
  // }
  markdownLines.push("}}");
  return markdownToHtml(markdownLines);
}

function markdownToHtml(markdownLines: string[]) {
  // Add line breaks and code tags
  const lines: string[] = [];
  markdownLines.forEach((line) => {
    line.split("<br>").forEach((subLine) => {
      lines.push(`${subLine}<br>`);
    });
  });
  return `<code>${lines.join("")}</code>`;
}
