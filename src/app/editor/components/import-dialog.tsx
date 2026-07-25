"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import type { ChangeEvent} from "react";

import type { Monster } from "@/schema/monster-schema";
import type {
  ImportFormat} from "@/services/converters/detect-import-format";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  IMPORT_FORMAT_LABELS,
  detectImportFormat,
} from "@/services/converters/detect-import-format";
import { convertImport } from "@/services/converters/import-to-monster";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ParseState =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "parsed"; data: unknown; detected: ImportFormat | null };

function parseInput(raw: string): ParseState {
  if (!raw.trim()) return { status: "empty" };
  try {
    const data = JSON.parse(raw);
    return { status: "parsed", data, detected: detectImportFormat(data) };
  } catch {
    return { status: "invalid" };
  }
}

export function ImportDialog({
  open,
  onOpenChange,
}: Readonly<ImportDialogProps>) {
  const form = useFormContext<Monster>();
  const [raw, setRaw] = useState("");
  const [override, setOverride] = useState<ImportFormat | null>(null);

  const parsed = useMemo(() => parseInput(raw), [raw]);
  const format =
    override ?? (parsed.status === "parsed" ? parsed.detected : null);

  function updateRaw(next: string) {
    setRaw(next);
    setOverride(null);
  }

  function readFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Only JSON files are supported");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateRaw(reader.result as string);
    reader.onerror = () => toast.error("Could not read the file");
    reader.readAsText(file);
  }

  function reset() {
    setRaw("");
    setOverride(null);
  }

  function handleImport() {
    if (parsed.status !== "parsed" || !format) return;
    try {
      const monster = convertImport(format, parsed.data);
      form.reset(monster);
      toast.success(`Imported ${monster.name || "creature"}`);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        `Import failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import creature</DialogTitle>
          <DialogDescription>
            Upload a JSON file or paste the contents below. The format is
            detected automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="import-file">File</Label>
          <input
            id="import-file"
            type="file"
            accept=".json,application/json"
            onChange={readFile}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-foreground hover:file:bg-accent"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="import-text">Or paste JSON</Label>
          <Textarea
            id="import-text"
            value={raw}
            onChange={(e) => updateRaw(e.target.value)}
            placeholder="Paste your creature JSON here…"
            className="h-40 font-mono text-xs"
          />
        </div>

        <ImportStatus parsed={parsed} format={format} onPick={setOverride} />

        <DialogFooter>
          <DialogClose render={<Button type="button" color="neutral" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="button" disabled={!format} onClick={handleImport}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ALL_FORMATS = Object.keys(IMPORT_FORMAT_LABELS) as Array<ImportFormat>;

function ImportStatus({
  parsed,
  format,
  onPick,
}: Readonly<{
  parsed: ParseState;
  format: ImportFormat | null;
  onPick: (format: ImportFormat) => void;
}>) {
  if (parsed.status === "empty") return null;

  if (parsed.status === "invalid") {
    return (
      <p className="text-xs text-destructive">
        That doesn&apos;t look like valid JSON.
      </p>
    );
  }

  if (format) {
    return (
      <p className="text-xs text-muted-foreground">
        Detected format:{" "}
        <span className="font-medium text-foreground">
          {IMPORT_FORMAT_LABELS[format]}
        </span>
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">
        Couldn&apos;t detect the format. Pick one to import as:
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_FORMATS.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            color="neutral" variant="outline"
            onClick={() => onPick(option)}
          >
            {IMPORT_FORMAT_LABELS[option]}
          </Button>
        ))}
      </div>
    </div>
  );
}
