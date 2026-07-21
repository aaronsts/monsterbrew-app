"use client";

import { CheckIcon, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type GroupedOptions = {
  [key: string]: Array<Option>;
};

interface MultiSelectProps {
  title?: string;
  options?: Array<Option>;
  groupedOptions?: GroupedOptions;
  selectedValues: Set<string>;
   
  onSelectionChange: (next: Set<string>) => void;
  className?: string;
  search?: boolean;
  numberOfTags?: number;
}

/**
 * Legacy multi-select popover ported from the pre-Base-UI editor. Kept local to
 * the legacy editor so it can compile against Base-UI primitives without
 * reintroducing the deleted shared `@/components/ui/multi-select`.
 */
export function MultiSelect({
  title,
  options,
  groupedOptions,
  selectedValues,
  onSelectionChange,
  className,
  search = false,
  numberOfTags = 5,
}: MultiSelectProps) {
  const handleClear = (option: string) => {
    const next = new Set(selectedValues);
    next.delete(option);
    onSelectionChange(next);
  };

  const toggle = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onSelectionChange(next);
  };

  const renderOptions = (opts: Array<Option>) =>
    opts.map((option) => {
      const isSelected = selectedValues.has(option.value);
      return (
        <CommandItem key={option.value} onSelect={() => toggle(option.value)}>
          <div
            className={cn(
              "mr-2 flex h-4 w-4 items-center justify-center rounded-none border border-primary",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "opacity-50 [&_svg]:invisible",
            )}
          >
            <CheckIcon className="h-4 w-4" />
          </div>
          {option.icon && (
            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{option.label}</span>
        </CommandItem>
      );
    });

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "flex h-auto min-h-9 w-full items-center justify-between px-3 py-1",
              className,
            )}
          />
        }
      >
        <div className="flex flex-grow flex-wrap items-center gap-1 overflow-hidden text-sm">
          {selectedValues.size > 0 ? (
            selectedValues.size <= numberOfTags ? (
              Array.from(selectedValues).map((option) => (
                <Badge variant="secondary" key={option}>
                  <span>{option}</span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      handleClear(option);
                    }}
                  >
                    <X className="size-3!" />
                  </span>
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">
                {selectedValues.size}+ Selected
              </Badge>
            )
          ) : (
            <span className="font-normal text-muted-foreground">{title}</span>
          )}
        </div>
        <div className="flex items-center self-stretch pl-1 text-muted-foreground">
          {selectedValues.size > 0 ? (
            <span
              onClick={(e) => {
                e.preventDefault();
                onSelectionChange(new Set());
              }}
            >
              <X className="size-4" />
            </span>
          ) : (
            <ChevronsUpDown className="size-4" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {search && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {options && <CommandGroup>{renderOptions(options)}</CommandGroup>}
            {groupedOptions &&
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <CommandGroup key={groupName} heading={groupName}>
                  {renderOptions(groupOptions)}
                </CommandGroup>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
