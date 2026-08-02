import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";

const NUDGE_CHANGE_THRESHOLD = 10;
const NUDGE_DELAY_MS = 30_000;

interface UseSaveNudgeProps {
  enabled: boolean;
}

/**
 * Whether the editor should nudge the user to save a brand-new creature —
 * true after enough edits (or 30s after the first one) have accumulated
 * without a save. The alert itself is rendered by `MonsterForm` (see #137;
 * this used to be a toast).
 */
export function useSaveNudge(
  form: UseFormReturn<Monster>,
  { enabled }: UseSaveNudgeProps,
): boolean {
  const { subscribe } = form;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let changes = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ type }) => {
        if (type !== "change") return;
        changes += 1;
        if (!timer) timer = setTimeout(() => setShow(true), NUDGE_DELAY_MS);
        if (changes === NUDGE_CHANGE_THRESHOLD) setShow(true);
      },
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [enabled, subscribe]);

  // Saving disables the nudge (the creature gains an id), so hide rather
  // than latch the last shown state.
  return enabled && show;
}
