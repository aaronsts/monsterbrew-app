import { calculateStatBonus, cn } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import Markdown from "react-markdown";
import { z } from "zod";

interface DescriptionProps extends Partial<HTMLParagraphElement> {
  title: string;
  description: string | number;
  show?: boolean;
  placeholder?: string;
}

export function Description({
  title,
  description,
  show = true,
  className,
  placeholder = "",
}: DescriptionProps) {
  if (!show) return null;

  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const name = watch("name");
  const abilityScores = watch("ability_scores");
  const cr = watch("cr");

  const mappings = {
    "[MON]": name || "'creature'",
    "[DEX ATK]": `+${
      calculateStatBonus(abilityScores.dex) + cr.proficiency_bonus
    }`,
    "[STR ATK]": `+${
      calculateStatBonus(abilityScores.str) + cr.proficiency_bonus
    }`,
    "[WIS ATK]": `+${
      calculateStatBonus(abilityScores.wis) + cr.proficiency_bonus
    }`,
    "[INT ATK]": `+${
      calculateStatBonus(abilityScores.int) + cr.proficiency_bonus
    }`,
    "[CHA ATK]": `+${
      calculateStatBonus(abilityScores.cha) + cr.proficiency_bonus
    }`,
    "[CON ATK]": `+${
      calculateStatBonus(abilityScores.con) + cr.proficiency_bonus
    }`,
  };

  function parseDescription(value: string | number) {
    if (typeof value === "number") return value.toString();

    return value
      .replaceAll("[MON]", mappings["[MON]"] || "'creature'")
      .replaceAll("[DEX ATK]", mappings["[DEX ATK]"])
      .replaceAll("[STR ATK]", mappings["[STR ATK]"])
      .replaceAll("[WIS ATK]", mappings["[WIS ATK]"])
      .replaceAll("[INT ATK]", mappings["[INT ATK]"])
      .replaceAll("[CHA ATK]", mappings["[CHA ATK]"])
      .replaceAll("[CON ATK]", mappings["[CON ATK]"]);
  }

  const markdownString = `***${title}.*** ${parseDescription(
    description || placeholder
  )}`;

  return (
    <Markdown
      components={{
        strong: ({ node, ...props }) => (
          <strong className="font-semibold pr-1" {...props} />
        ),
      }}
    >
      {markdownString}
    </Markdown>
  );
}
