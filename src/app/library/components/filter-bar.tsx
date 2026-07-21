"use client";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CR_MAX, CR_VALUES, TYPE_OPTIONS } from "./filters";

export function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  crRange,
  onCrChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  crRange: [number, number];
  onCrChange: (value: [number, number]) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 rounded-none bg-muted/40 p-4 ring-1 ring-foreground/10 md:flex-row md:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="library-search">Search by name</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="library-search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search creatures…"
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            items={TYPE_OPTIONS}
            value={typeFilter}
            onValueChange={(value) => onTypeChange(value as string)}
          >
            <SelectTrigger className="mb-0 w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:w-56">
          <div className="flex justify-between">
            <Label>Challenge rating</Label>
            <span className="text-xs leading-none tabular-nums text-muted-foreground">
              {CR_VALUES[crRange[0]]}
              {crRange[0] !== crRange[1] ? `–${CR_VALUES[crRange[1]]}` : ""}
            </span>
          </div>
          <div className="flex items-center h-8">
            <Slider
              min={0}
              max={CR_MAX}
              step={1}
              value={crRange}
              onValueChange={(value) => onCrChange(value as [number, number])}
            />
          </div>
        </div>
      </div>
      <p className="text-[11px] mt-2 float-right text-muted-foreground">
        Showing {resultCount} of {totalCount}
      </p>
    </div>
  );
}
