"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { monsterbrewDB } from "@/services/database";
import { downloadCreatureBackup } from "@/services/backup";
import { migrateCreature } from "@/services/migrations/migrateCreature";

type Phase =
  | { status: "prompt" }
  | { status: "migrating" }
  | { status: "success"; name: string }
  | { status: "error"; reason: string };

interface MigrateDialogProps {
  /** The legacy creature to migrate, or null when the dialog is closed. */
  creature: { id?: string; name?: string } | null;
  open: boolean;
  // eslint-disable-next-line no-unused-vars -- false positive on callback param type
  onOpenChange: (open: boolean) => void;
  /** Called after a successful migration so the caller can refresh its list. */
  onMigrated: () => void;
}

export function MigrateDialog({
  creature,
  open,
  onOpenChange,
  onMigrated,
}: MigrateDialogProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ status: "prompt" });

  // Reset back to the prompt whenever a fresh creature/dialog is opened.
  useEffect(() => {
    if (open) setPhase({ status: "prompt" });
  }, [open, creature]);

  const name = creature?.name || "this creature";

  async function handleMigrate() {
    if (!creature) return;
    setPhase({ status: "migrating" });

    const result = migrateCreature(creature);
    if (result.status === "error") {
      setPhase({ status: "error", reason: result.reason });
      return;
    }

    try {
      const db = await monsterbrewDB();
      try {
        // The store is typed for the legacy shape; the migrated record shares
        // the same `id` keyPath and overwrites it in place.
        await db.put(
          "creatures",
          result.creature as unknown as Parameters<typeof db.put>[1],
        );
      } finally {
        db.close();
      }
      setPhase({ status: "success", name: result.creature.name || name });
      toast.success(`Migrated ${result.creature.name || name}`);
      onMigrated();
    } catch (err) {
      setPhase({
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  function openLegacyEditor() {
    if (!creature) return;
    localStorage.setItem("editCreature", JSON.stringify(creature));
    onOpenChange(false);
    router.push("/legacy-editor");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {phase.status === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                Migration complete
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">
                  {phase.name}
                </span>{" "}
                was migrated to the new format and is ready to use in the new
                editor.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : phase.status === "error" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                Migration failed
              </DialogTitle>
              <DialogDescription>
                {name} could not be migrated and was left unchanged. You can
                still edit it in the legacy editor.
              </DialogDescription>
            </DialogHeader>
            <p className="max-h-32 overflow-auto rounded-none bg-muted p-2 font-mono text-[11px] break-words text-muted-foreground">
              {phase.reason}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="secondary" onClick={openLegacyEditor}>
                Open in legacy editor
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                Legacy format
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">{name}</span> uses
                the legacy format and must be migrated to open in the new
                editor. This overwrites the saved creature in place — download a
                backup first if you want a safety copy.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => downloadCreatureBackup()}
                className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                <Download className="size-3" />
                Download a backup first
              </button>
              <button
                type="button"
                onClick={openLegacyEditor}
                className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Or edit it in the legacy editor without migrating
              </button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={phase.status === "migrating"}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMigrate}
                disabled={phase.status === "migrating"}
              >
                {phase.status === "migrating" ? "Migrating…" : "Migrate"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
