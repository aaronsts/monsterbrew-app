"use client";

import { useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Download, FileText, Printer } from "lucide-react";
import type { RefObject } from "react";

import type { Monster } from "@/schema/monster-schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportMarkdownDialog } from "@/app/library/components/export-markdown-dialog";

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

interface CreatureExportMenuProps {
  creature: Monster;
  /** Ref wrapping the on-page statblock, used as the PDF print target. */
  statblockRef: RefObject<HTMLDivElement | null>;
}

/** Export dropdown for a library creature: Homebrewery markdown and PDF. */
export function CreatureExportMenu({
  creature,
  statblockRef,
}: Readonly<CreatureExportMenuProps>) {
  const [markdownOpen, setMarkdownOpen] = useState(false);

  const printStatblock = useReactToPrint({
    contentRef: statblockRef,
    documentTitle: creature.name || "creature",
    pageStyle: PDF_PAGE_STYLE,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setMarkdownOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Markdown (Homebrewery)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => printStatblock()}>
            <Printer className="mr-2 h-4 w-4" />
            PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportMarkdownDialog
        creature={creature}
        open={markdownOpen}
        onOpenChange={setMarkdownOpen}
      />
    </>
  );
}
