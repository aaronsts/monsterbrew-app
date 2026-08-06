"use client";

import { useState } from "react";
import { BookOpen, FilePlus2, Upload } from "lucide-react";
import { StartOption } from "./option";
import { RecentCreatures } from "./recent-creatures";
import { CreaturePicker } from "./creature-picker";
import type { Monster } from "@/schema/monster-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewCreatureDialogProps {
  open: boolean;
  /**
   * Dismissal in any form — the blank option, the close button, Escape, or a
   * click outside — means "start blank", which is today's empty form.
   */
  onStartBlank: () => void;
  /** Open the editor's existing import dialog. */
  onImport: () => void;
  /** Load an existing creature (SRD or your own) as a fresh, unsaved copy. */
  onPickCreature: (monster: Monster) => void;
  /** Open an already-saved creature by id. */
  onPickRecent: (id: string) => void;
}

export function NewCreatureDialog({
  open,
  onStartBlank,
  onImport,
  onPickCreature,
  onPickRecent,
}: Readonly<NewCreatureDialogProps>) {
  const [showCreaturePicker, setShowCreaturePicker] = useState(false);

  // The dialog also closes for reasons that never reach `onOpenChange`
  if (!open && showCreaturePicker) setShowCreaturePicker(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (showCreaturePicker) {
          setShowCreaturePicker(false);
          return;
        }
        onStartBlank();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {showCreaturePicker
              ? "Start from an existing creature"
              : "Create a new creature"}
          </DialogTitle>
          <DialogDescription>
            {showCreaturePicker
              ? "Creates a copy, the original is left untouched."
              : "Pick something to build on, or start from an empty statblock."}
          </DialogDescription>
        </DialogHeader>

        {showCreaturePicker ? (
          <CreaturePicker
            onPick={onPickCreature}
            onBack={() => setShowCreaturePicker(false)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <StartOption
              icon={FilePlus2}
              title="Blank creature"
              description="Start from scratch with an empty statblock"
              onClick={onStartBlank}
            />
            <StartOption
              icon={BookOpen}
              title="Existing creature"
              description="Build on one of your creatures or any of the 2024 SRD creatures."
              onClick={() => setShowCreaturePicker(true)}
            />
            <StartOption
              icon={Upload}
              title="Import or paste"
              description="Bring in JSON from 5eTools, Improved Initiative, Open5e or TetraCube."
              onClick={onImport}
            />
            <RecentCreatures onPick={onPickRecent} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
