"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";

interface CollapsibleSectionProps {
  id?: string;
  legend: string;
  description: string;
  children: React.ReactNode;
}

export const CollapsibleSection = ({
  id,
  legend,
  description,
  children,
}: CollapsibleSectionProps) => {
  return (
    <Collapsible
      defaultOpen
      render={<FieldSet id={id} className="gap-0 scroll-mt-24 lg:scroll-mt-32" />}
    >
      <FieldLegend className="mb-0 w-full">
        <CollapsibleTrigger className="group/section-trigger flex w-full items-center justify-between gap-2 bg-primary-100 dark:bg-primary-500 px-3 py-2 text-left outline-none transition-colors focus-visible:border-ring dark:text-primary-100 focus-visible:ring-1 focus-visible:ring-ring/50">
          {legend}
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/section-trigger:rotate-180" />
        </CollapsibleTrigger>
      </FieldLegend>
      <CollapsibleContent
        keepMounted
        className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0"
      >
        <div className="flex flex-col gap-4 border border-t-0 border-primary-100 dark:border-primary-500 p-4">
          <FieldDescription>{description}</FieldDescription>
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
