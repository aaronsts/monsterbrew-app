"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Tag({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <code className="rounded-none bg-muted px-1 py-0.5 text-[11px] whitespace-nowrap">
      {children}
    </code>
  );
}

/** Explains the `{@…}` tagging system used in description fields. */
export function TagHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto gap-1 text-xs text-muted-foreground"
          />
        }
      >
        <CircleHelp className="size-3.5" />
        How tags work
      </DialogTrigger>
      <DialogContent className="gap-3 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>The tag system</DialogTitle>
          <DialogDescription>
            Descriptions can embed <Tag>{"{@…}"}</Tag> tags — small
            placeholders that the editor, the preview and every export turn
            into proper statblock text.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1">
          <p className="font-medium">Full lines</p>
          <p className="text-muted-foreground">
            <span className="text-foreground">Attack line</span> and{" "}
            <span className="text-foreground">Saving throw line</span> insert a
            single tag that renders a complete rules line, e.g.{" "}
            <Tag>{"{@attack m|str|5|1d6+str|slashing}"}</Tag>. Click its
            highlighted preview in the field to edit the parts — attack kind,
            to-hit, reach, damage — in a popup.
          </p>
        </div>

        <div className="grid gap-1">
          <p className="font-medium">Stat-linked values</p>
          <p className="text-muted-foreground">
            Wherever a number fits, an ability keyword works too:{" "}
            <Tag>{"{@hit str}"}</Tag>, <Tag>{"{@dc con}"}</Tag> or{" "}
            <Tag>{"{@damage 1d6 + str}"}</Tag>. These derive from the
            creature&apos;s ability scores and proficiency bonus, and update
            live when its stats change.
          </p>
        </div>

        <div className="grid gap-1">
          <p className="font-medium">Inline tags</p>
          <p className="text-muted-foreground">
            Smaller tags cover single values inside a sentence —{" "}
            <Tag>{"{@damage 2d6}"}</Tag>, <Tag>{"{@dice 1d20 + 3}"}</Tag>,{" "}
            <Tag>{"{@condition prone}"}</Tag>, <Tag>{"{@spell fireball}"}</Tag>
            , <Tag>{"{@recharge 5}"}</Tag>. Anything the editor doesn&apos;t
            recognize falls back to its plain text, so imported descriptions
            stay readable.
          </p>
        </div>

        <p className="text-muted-foreground">
          Tip: type <Tag>{"{@"}</Tag> in a description field to autocomplete a
          tag.
        </p>
      </DialogContent>
    </Dialog>
  );
}
