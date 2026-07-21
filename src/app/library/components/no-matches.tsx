"use client";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-foreground/10">
        <Search className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading text-lg font-bold tracking-wide">
          No creatures match your filters
        </h3>
        <p className="max-w-sm text-muted-foreground">
          Try a different name, type, or challenge rating range.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}
