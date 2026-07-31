import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { isLegacyCreature } from "@/services/migrations/creatureFormat";
import { creatureToMonster } from "@/services/migrations/creatureToMonster";

/**
 * Fallback load path for the editor: hydrate the form once from the
 * `localStorage.editCreature` handoff key (set when navigating "edit" / "copy" /
 * "duplicate" from elsewhere), then clear the key. Disabled while `?id=` is
 * present — the `useCreature` query owns loading in that case.
 *
 * Returns the handed-off creature's id (if the payload carried one) so the
 * editor can treat the creature as already saved.
 */
export function useEditCreatureHandoff(
  form: UseFormReturn<Monster>,
  { enabled }: { enabled: boolean },
): string | undefined {
  const [handoffId, setHandoffId] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled) return;
    const handoff = localStorage.getItem("editCreature");
    if (!handoff) return;
    try {
      const parsed = JSON.parse(handoff);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed.id) setHandoffId(parsed.id);
      // Handoffs (SRD copy, duplicate, library edit) normally already emit
      // `Monster`, but normalize any stale legacy-shaped payload just in case.
      const monster: Monster = isLegacyCreature(parsed)
        ? creatureToMonster(parsed)
        : (parsed as Monster);
      form.reset(monster);
    } catch (error) {
      console.error("Error parsing stored creature:", error);
    } finally {
      localStorage.removeItem("editCreature");
    }
  }, [form, enabled]);

  return handoffId;
}
