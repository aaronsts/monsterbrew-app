"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Printer } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { monsterToHomebrewery } from "@/services/converters/to-markdown";
import { monsterToFoundryActor } from "@/services/converters/to-foundry";
import { toImprovedInitiative } from "@/services/converters/to-improved-initiative";
import { creatureFileSlug } from "@/lib/utils";

type ExportFormat = "homebrewery" | "foundry" | "improved-initiative" | "pdf";

interface ExportDialogProps {
  creature: Monster;
  onPrint: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS: Array<{ id: ExportFormat; label: string }> = [
  { id: "homebrewery", label: "Homebrewery" },
  { id: "foundry", label: "FoundryVTT" },
  { id: "improved-initiative", label: "Improved Initiative" },
  { id: "pdf", label: "PDF" },
];

const BLURB: Record<ExportFormat, string> = {
  homebrewery:
    "Paste this into a new brew at homebrewery.naturalcrit.com, or save it as a .md file.",
  foundry: "Save this as a .json file, then import it into Foundry. [Beta]",
  "improved-initiative":
    "Save this as a .json file, then import in Improved Initiative.",
  pdf: "Opens your browser's print dialog with the statblock laid out for paper.",
};

/** Filename suffix and MIME type per downloadable format. */
const DOWNLOAD: Record<
  Exclude<ExportFormat, "pdf">,
  { fileName: (slug: string) => string; type: string; label: string }
> = {
  homebrewery: {
    fileName: (slug) => `${slug}.md`,
    type: "text/markdown",
    label: "Save .md",
  },
  foundry: {
    // The `fvtt-Actor-` prefix matches Foundry's own export naming, so the file
    // looks familiar next to ones exported from Foundry itself.
    fileName: (slug) => `fvtt-Actor-${slug}.json`,
    type: "application/json",
    label: "Save .json",
  },
  "improved-initiative": {
    fileName: (slug) => `${slug}-improved-initiative.json`,
    type: "application/json",
    label: "Save .json",
  },
};

export function ExportDialog({
  creature,
  onPrint,
  open,
  onOpenChange,
}: Readonly<ExportDialogProps>) {
  const [format, setFormat] = useState<ExportFormat>("homebrewery");
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    if (format === "homebrewery") return monsterToHomebrewery(creature);
    if (format === "foundry")
      return JSON.stringify(monsterToFoundryActor(creature), null, 2);
    if (format === "improved-initiative")
      return JSON.stringify(toImprovedInitiative(creature), null, 2);
    return null;
  }, [format, creature]);

  const download =
    format === "pdf"
      ? null
      : {
          ...DOWNLOAD[format],
          name: DOWNLOAD[format].fileName(creatureFileSlug(creature.name)),
        };

  async function handleCopy() {
    if (text === null) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  function handleSave() {
    if (text === null || download === null) return;
    const blob = new Blob([text], { type: download.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = download.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[70dvh] flex-col sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Export {creature.name || "creature"}</DialogTitle>
          <DialogDescription>{BLURB[format]}</DialogDescription>
        </DialogHeader>

        <Tabs
          className="flex min-h-0 flex-1 flex-col"
          value={format}
          onValueChange={(value) => {
            setFormat(value as ExportFormat);
            setCopied(false);
          }}
        >
          <TabsList className="mb-3 shrink-0">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent className="min-h-0 flex-1" value={format}>
            {text === null ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <Printer className="size-10 text-muted-foreground" />
                <p className="max-w-sm text-sm text-muted-foreground">
                  The statblock prints in two columns so a typical creature fits
                  on one page.
                </p>
                <Button type="button" onClick={onPrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print statblock
                </Button>
              </div>
            ) : (
              <Textarea
                readOnly
                value={text}
                onFocus={(e) => e.currentTarget.select()}
                className="h-full resize-none font-mono text-xs"
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="shrink-0">
          <DialogClose
            render={<Button type="button" color="neutral" variant="outline" />}
          >
            Close
          </DialogClose>
          {text !== null && download !== null && (
            <>
              <Button
                type="button"
                color="neutral"
                variant="outline"
                onClick={handleSave}
              >
                <Download className="mr-2 h-4 w-4" />
                {download.label}
              </Button>
              <Button type="button" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
