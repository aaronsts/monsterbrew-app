import { CHALLENGE_RATINGS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export function Traits() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  const creature = watch();

  const cr = CHALLENGE_RATINGS.find(
    (r) => r.challenge_rating === creature.challenge_rating
  );

  const savingThrows = creature.saving_throws
    ? creature.saving_throws.map(
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

  return (
    <div>
      {savingThrows.length > 0 && (
        <div className="flex gap-3">
          <h4>Saving Throws</h4>
          <p>{savingThrows.join(", ")}</p>
        </div>
      )}
      <div className="flex gap-3">
        <h4>Challenge Rating</h4>
        <p>
          {cr?.challenge_rating || 0} ({cr?.experience || 0} XP)
        </p>
      </div>
    </div>
  );
}
