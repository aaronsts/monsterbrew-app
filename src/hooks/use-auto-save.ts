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
  /**
   * Minimum time the "saving" status is held, in ms. IndexedDB writes are
   * near-instant, so without this the indicator flips to "saved" too fast for
   * users to ever see their work being saved.
   */
  minSavingTime?: number;
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
  { id, enabled, delay = 1000, minSavingTime = 500 }: UseAutoSaveOptions,
) {
  const { subscribe, getValues } = form;
  const { mutateAsync } = useAutoSaveCreature();
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const runSave = useCallback(async () => {
    if (!enabled || !id) return;

    const parsed = monsterSchema.safeParse(getValues());
    if (!parsed.success) return;

    try {
      setStatus("saving");
      const startedAt = Date.now();
      await mutateAsync({ ...parsed.data, id });
      const remaining = minSavingTime - (Date.now() - startedAt);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setStatus("saved");
      setLastSavedAt(Date.now());
    } catch {
      setStatus("error");
    }
  }, [enabled, getValues, id, minSavingTime, mutateAsync]);

  const debouncedSave = useMemo(
    () => debounce(runSave, delay),
    [runSave, delay],
  );

  useEffect(() => {
    if (!enabled || !id) return;
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: () => debouncedSave(),
    });
    return () => {
      unsubscribe();
      debouncedSave.cancel();
    };
  }, [enabled, id, debouncedSave, subscribe]);

  return { status, lastSavedAt };
}
