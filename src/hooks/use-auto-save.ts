import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { useAutoSaveCreature } from "@/hooks/use-creatures";
import { debounce } from "@/lib/utils";
import { monsterSchema } from "@/schema/monster-schema";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  /** The creature's id. Auto-save is inert until this is set. */
  id: string | undefined;
  /** Master switch — when false, no saving happens regardless of id. */
  enabled: boolean;
  /** Debounce window after the last change, in ms. */
  delay?: number;
}

/**
 * Debounced auto-save for the editor form (see #93). Persists valid form changes
 * to IndexedDB `delay` ms after the last edit, but only once the creature has an
 * `id` (i.e. after the first manual Save) so we never spawn junk records while a
 * new creature is still being filled out. Invalid drafts are skipped so the
 * existing `monsterSchema` validation is respected.
 */
export function useAutoSave(
  form: UseFormReturn<Monster>,
  { id, enabled, delay = 800 }: UseAutoSaveOptions,
) {
  const { mutateAsync } = useAutoSaveCreature();
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const runSave = useCallback(async () => {
    if (!enabled || !id) return;

    const parsed = monsterSchema.safeParse(form.getValues());
    if (!parsed.success) return;

    try {
      setStatus("saving");
      await mutateAsync({ ...parsed.data, id });
      setStatus("saved");
      setLastSavedAt(Date.now());
    } catch {
      setStatus("error");
    }
  }, [form, enabled, id, mutateAsync]);

  const debouncedSave = useMemo(() => debounce(runSave, delay), [runSave, delay]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (!enabled || !id) return;
      debouncedSave();
    });
    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [form, enabled, id, debouncedSave]);

  return { status, lastSavedAt };
}
