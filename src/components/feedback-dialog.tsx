"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";

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

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const feedback = useSendFeedback();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFeedbackConfigured) {
      toast.error(
        "The feedback form isn't set up yet. Please open a GitHub issue instead.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    feedback.mutate(
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
      <DialogTrigger
        render={
          <button className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground" />
        }
      >
        <MessageSquare className="size-4" />
        Send feedback
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Found a bug, missing a feature, or just want to share something? It
            lands straight in my inbox.
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
            <p className="text-xs text-muted-foreground">
              Only if you'd like a reply.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              name="message"
              required
              minLength={10}
              placeholder="What's on your mind?"
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={feedback.isPending}>
              <Send className="size-3.5" />
              {feedback.isPending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
