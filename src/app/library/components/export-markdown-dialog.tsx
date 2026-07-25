"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download } from "lucide-react";

import type { Monster } from "@/schema/monster-schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { monsterToHomebrewery } from "@/services/converters/to-markdown";

interface ExportMarkdownDialogProps {
  creature: Monster;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fileName(name: string): string {
  const slug = name.trim().replaceAll(/\s+/g, "-").toLowerCase();
  return `${slug || "creature"}.md`;
}

export function ExportMarkdownDialog({
  creature,
  open,
  onOpenChange,
}: Readonly<ExportMarkdownDialogProps>) {
  const markdown = useMemo(() => monsterToHomebrewery(creature), [creature]);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  function handleSave() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(creature.name);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Homebrewery V3 markdown</DialogTitle>
          <DialogDescription>
            Copy this into a new brew at homebrewery.naturalcrit.com, or save it
            as a <code>.md</code> file.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          readOnly
          value={markdown}
          onFocus={(e) => e.currentTarget.select()}
          className="h-[55vh] resize-none font-mono text-xs"
        />

        <DialogFooter>
          <DialogClose render={<Button type="button" color="neutral" variant="outline" />}>
            Close
          </DialogClose>
          <Button type="button" color="neutral" variant="outline" onClick={handleSave}>
            <Download className="mr-2 h-4 w-4" />
            Save .md
          </Button>
          <Button type="button" onClick={handleCopy}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
