"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

import { LoadingSpinner } from "./ui/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isFeedbackConfigured, useSendFeedback } from "@/hooks/use-feedback";

interface FeedbackDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeedbackDialog({
  open: openProp,
  onOpenChange,
}: FeedbackDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;
  const { mutate, isPending } = useSendFeedback();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFeedbackConfigured) {
      toast.error(
        "The feedback form isn't set up yet. Please open a GitHub issue instead.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    mutate(
      {
        email: formData.get("email")?.toString(),
        message: formData.get("message")?.toString() ?? "",
        botcheck: formData.get("botcheck")?.toString(),
      },
      {
        onSuccess: () => {
          toast.success("Thanks for the feedback!");
          setOpen(false);
        },
        onError: () => {
          toast.error("Couldn't send your feedback. Please try again later.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          render={
            <button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground" />
          }
        >
          <MessageSquare className="size-4" />
          Send feedback
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Found a bug, have an idea for a feature, or just want to share
            something? Let me know!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            className="hidden"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-email">Email (optional)</Label>
            <Input
              id="feedback-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              name="message"
              required
              minLength={10}
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoadingSpinner />}
              <Send className="size-3.5" />
              {isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
