import { useCallback, useEffect, useRef, useState } from "react";
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

  // Snapshot of the last state known to be persisted (our own save, or the
  // baseline adopted when the stored creature syncs in). Saving writes back
  // into the query cache, which resyncs the form and emits a reset event —
  // without this guard that echo schedules a second, identical save.
  const lastSavedRef = useRef<string | null>(null);

  const snapshotValues = useCallback(() => {
    const parsed = monsterSchema.safeParse(getValues());
    return parsed.success
      ? JSON.stringify({ ...parsed.data, id })
      : null;
  }, [getValues, id]);

  const runSave = useCallback(async () => {
    if (!enabled || !id) return;

    const parsed = monsterSchema.safeParse(getValues());
    if (!parsed.success) return;

    const record = { ...parsed.data, id };
    const snapshot = JSON.stringify(record);
    if (snapshot === lastSavedRef.current) return;

    try {
      setStatus("saving");
      const startedAt = Date.now();
      await mutateAsync(record);
      lastSavedRef.current = snapshot;
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

  useEffect(() => {
    if (!enabled || !id) return;
    // Arming happens only once the form holds persisted state (after a manual
    // save, or once the stored creature hydrated the form — see the `enabled`
    // gate in monster-form), so the current values are the baseline. Without
    // this, harmless post-load events (like the derived passive-perception
    // setValue) would immediately re-save the state we just loaded.
    lastSavedRef.current = snapshotValues();
    const debouncedSave = debounce(runSave, delay);
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ name }) => {
        // `name == null` is a whole-form replacement. Before anything was
        // saved that's the stored creature syncing in: adopt it as the
        // baseline rather than saving it back. Later replacements (e.g. an
        // import) do schedule; true echoes are caught by the snapshot guard.
        if (name == null && lastSavedRef.current == null) {
          lastSavedRef.current = snapshotValues();
          return;
        }
        debouncedSave();
      },
    });
    return () => {
      unsubscribe();
      debouncedSave.cancel();
    };
  }, [enabled, id, runSave, delay, subscribe, snapshotValues]);

  return { status, lastSavedAt };
}
