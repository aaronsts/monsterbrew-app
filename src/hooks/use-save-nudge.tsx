import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { Button } from "@/components/ui/button";

const NUDGE_TOAST_ID = "save-nudge";

interface UseSaveNudgeProps {
  enabled: boolean;
  onSave: () => void | Promise<void>;
}
export function useSaveNudge(
  form: UseFormReturn<Monster>,
  { enabled, onSave }: UseSaveNudgeProps,
) {
  const { subscribe } = form;
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  });
  const shownRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      shownRef.current = false;
      return;
    }
    let changes = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const nudge = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      toast("You have unsaved changes", {
        id: NUDGE_TOAST_ID,
        description: "Save this creature to turn on auto-save.",
        action: (
          <Button
            size="xs"
            className="ml-auto"
            onClick={() => {
              toast.dismiss(NUDGE_TOAST_ID);
              void onSaveRef.current();
            }}
          >
            Save now
          </Button>
        ),
      });
    };

    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ type }) => {
        if (type !== "change") return;
        changes += 1;
        if (!timer) timer = setTimeout(nudge, 60_000);
        if (changes >= 10) nudge();
      },
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [enabled, subscribe]);
}
