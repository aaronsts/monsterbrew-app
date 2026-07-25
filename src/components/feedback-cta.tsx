"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, X } from "lucide-react";

import { Button } from "./ui/button";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { isFeedbackConfigured } from "@/hooks/use-feedback";

const STORAGE_KEY = "monsterbrew:feedback-cta-shown";
/** Wait 5 seconds after page load before popping up. */
const SHOW_DELAY_MS = 5_000;
/** The prompt stays on screen for 10 seconds before auto-dismissing. */
const TOAST_DURATION_MS = 10_000;
/** Once shown (or dismissed), stay quiet for 7 days. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1_000;

export function FeedbackCta() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isFeedbackConfigured) return;

    const lastShown = Number(localStorage.getItem(STORAGE_KEY));
    if (lastShown && Date.now() - lastShown < SNOOZE_MS) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      toast.custom(
        (id) => (
          <FeedbackCtaCard
            onOpenForm={() => {
              toast.dismiss(id);
              setOpen(true);
            }}
            onDismiss={() => toast.dismiss(id)}
          />
        ),
        { duration: TOAST_DURATION_MS },
      );
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return <FeedbackDialog open={open} onOpenChange={setOpen} />;
}

interface FeedbackCtaCardProps {
  onOpenForm: () => void;
  onDismiss: () => void;
}

function FeedbackCtaCard({
  onOpenForm,
  onDismiss,
}: Readonly<FeedbackCtaCardProps>) {
  return (
    <div className="flex w-(--width) items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-lg">
      <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
      <button
        type="button"
        onClick={onOpenForm}
        className="flex flex-1 flex-col gap-1 text-left"
      >
        <p className="text-sm font-medium">Enjoying Monsterbrew?</p>
        <p className="text-xs text-muted-foreground">
          I'm open for any suggestions and feedback to improve your experience!
          :)
        </p>
      </button>
      <Button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        variant="transparent"
        size="icon"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
