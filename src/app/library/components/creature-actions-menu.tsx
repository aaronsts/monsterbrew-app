"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { Copy, Edit, FileText, Printer, Trash } from "lucide-react";
import type { RefObject } from "react";

import type { StoredMonster } from "@/schema/monster-schema";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExportMarkdownDialog } from "@/app/library/components/export-markdown-dialog";
import { useDeleteCreature } from "@/hooks/use-creatures";

const PDF_PAGE_STYLE = `
  @page { size: auto; margin: 10mm; }
  @media print {
    :root {
      --foreground: #1d1108 !important;
      --card: #fdf1dc !important;
      --card-foreground: #1d1108 !important;
      --popover: #fdf1dc !important;
      --popover-foreground: #1d1108 !important;
      --primary: #58180d !important;
      --primary-foreground: #fdf1dc !important;
      --muted-foreground: #5a4632 !important;
      --border: #58180d !important;
    }
    body { background: #ffffff; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* The 5e 2024 statblock is two-column. Print width never hits the md
       breakpoint that enables the columns, so force them on here — this also
       roughly halves the height so a typical creature fits on one page. */
    [data-slot="card-content"] {
      column-count: 2 !important;
      column-gap: 1.5rem !important;
    }
    [data-slot="card-content"] > * {
      break-inside: avoid;
    }
  }
`;

interface CreatureActionsMenuProps {
  creature: StoredMonster;
  /** Ref wrapping the on-page statblock, used as the PDF print target. */
  statblockRef: RefObject<HTMLDivElement | null>;
}

/**
 * Action buttons for a library creature: edit, duplicate, export
 * (Homebrewery markdown / PDF), and delete with confirmation. Separate
 * icon buttons with tooltips, not a dropdown (see #137).
 */
export function CreatureActionsMenu({
  creature,
  statblockRef,
}: Readonly<CreatureActionsMenuProps>) {
  const navigate = useNavigate();
  const deleteCreature = useDeleteCreature();

  const [markdownOpen, setMarkdownOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const printStatblock = useReactToPrint({
    contentRef: statblockRef,
    documentTitle: creature.name || "creature",
    pageStyle: PDF_PAGE_STYLE,
  });

  // Load the current creature into the editor for editing.
  const handleEdit = () => {
    toast.promise(
      new Promise<void>((resolve) => {
        localStorage.setItem("editCreature", JSON.stringify(creature));
        navigate({ to: "/editor" });
        resolve();
      }),
      {
        loading: `Loading ${creature.name} into editor...`,
        success: `${creature.name} ready for editing`,
        error: "Failed to load creature",
      },
    );
  };

  // Duplicate the creature and open the copy in the editor as a new creature.
  const handleDuplicate = () => {
    const { id: _id, ...rest } = creature;
    const creatureCopy = { ...rest, name: `Copy of ${creature.name}` };
    localStorage.setItem("editCreature", JSON.stringify(creatureCopy));
    navigate({ to: "/editor" });
  };

  // Delete the creature and return to the library.
  const handleDelete = () => {
    toast.promise(
      (async () => {
        if (!creature.id) {
          throw new Error("Could not find creature to delete");
        }
        await deleteCreature.mutateAsync(creature.id);
        return creature.name;
      })(),
      {
        loading: `Deleting ${creature.name}...`,
        success: (name) => {
          navigate({ to: "/library" });
          return `${name} deleted successfully`;
        },
        error: (err) => `Error deleting creature: ${err.message}`,
      },
    );
  };

  return (
    <>
      <TooltipProvider delay={200}>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  color="neutral"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Edit"
                  onClick={handleEdit}
                />
              }
            >
              <Edit />
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  color="neutral"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Duplicate"
                  onClick={handleDuplicate}
                />
              }
            >
              <Copy />
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  color="neutral"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Export Markdown (Homebrewery)"
                  onClick={() => setMarkdownOpen(true)}
                />
              }
            >
              <FileText />
            </TooltipTrigger>
            <TooltipContent>Export Markdown (Homebrewery)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  color="neutral"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Export PDF"
                  onClick={() => printStatblock()}
                />
              }
            >
              <Printer />
            </TooltipTrigger>
            <TooltipContent>Export PDF</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  color="destructive"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Delete"
                  onClick={() => setDeleteOpen(true)}
                />
              }
            >
              <Trash />
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <ExportMarkdownDialog
        creature={creature}
        open={markdownOpen}
        onOpenChange={setMarkdownOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {creature.name}?</DialogTitle>
            <DialogDescription>
              This removes the creature from your library. It can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button color="neutral" variant="outline" size="sm" />}
            >
              Cancel
            </DialogClose>
            <DialogClose
              render={<Button color="destructive" size="sm" />}
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
