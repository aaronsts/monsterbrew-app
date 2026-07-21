"use client";
import { Search } from "lucide-react";

import { CR_FILTER_ITEMS, TYPE_OPTIONS, crFilterLabel } from "./filters";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export function FilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  cr,
  onCrChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  cr: Array<string>;
  onCrChange: (value: Array<string>) => void;
  resultCount: number;
  totalCount: number;
}) {
  const crAnchor = useComboboxAnchor();

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
        <div className="space-y-1.5">
          <Label>Challenge rating</Label>
          <Combobox
            multiple
            items={CR_FILTER_ITEMS}
            value={cr}
            onValueChange={(value) => onCrChange(value)}
            itemToStringLabel={crFilterLabel}
          >
            <ComboboxChips ref={crAnchor} className="w-full mb-0  md:w-56">
              <ComboboxValue>
                {(selected: Array<string>) =>
                  selected.map((value) => (
                    <ComboboxChip key={value} aria-label={crFilterLabel(value)}>
                      {crFilterLabel(value)}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput
                placeholder={cr.length === 0 ? "Any CR" : ""}
              />
            </ComboboxChips>
            <ComboboxContent anchor={crAnchor}>
              <ComboboxEmpty>No challenge rating found.</ComboboxEmpty>
              <ComboboxList>
                {(value: string) => (
                  <ComboboxItem key={value} value={value}>
                    {crFilterLabel(value)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <p className="text-[11px] mt-2 float-right text-muted-foreground">
        Showing {resultCount} of {totalCount}
      </p>
    </div>
  );
}
