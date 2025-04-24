// ui/multi-select.tsx

"use client";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CheckIcon, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "./badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type GroupedOptions = {
  [key: string]: Option[];
};

interface MultiSelectProps {
  title?: string;
  options?: Option[];
  groupedOptions?: GroupedOptions;
  selectedValues: Set<string>;
  onSelectionChange: (selectedValues: Set<string>) => void;
  className?: string;
  search?: boolean;
  numberOfTags?: number;
}

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
    selectedValues.delete(option);
    onSelectionChange(selectedValues);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="form"
          className={cn(
            "flex min-h-[36px] cursor-pointer items-center justify-between rounded-md border px-3 py-1 data-[state=open]:border-ring w-full h-full ",
            className
          )}
        >
          <div
            className={cn(
              "flex flex-grow flex-wrap  items-center gap-1 overflow-hidden text-sm"
            )}
          >
            {selectedValues.size > 0 ? (
              selectedValues.size <= numberOfTags ? (
                Array.from(selectedValues)?.map((option) => (
                  <Badge variant="accent" key={option}>
                    <span>{option}</span>
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        handleClear(option);
                      }}
                    >
                      <X />
                    </span>
                  </Badge>
                ))
              ) : (
                <Badge variant="accent">{selectedValues.size}+ Selected</Badge>
              )
            ) : (
              <span className="font-normal italic text-carrara-600">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center self-stretch pl-1 text-muted-foreground/60 hover:text-foreground [&>div]:flex [&>div]:items-center [&>div]:self-stretch">
            {selectedValues.size > 0 ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  onSelectionChange(new Set());
                }}
              >
                <X className="size-4" />
              </div>
            ) : (
              <div>
                <ChevronsUpDown className="size-4" />
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {search && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {options && (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const newSelectedValues = new Set(selectedValues);
                        if (isSelected) {
                          newSelectedValues.delete(option.value);
                        } else {
                          newSelectedValues.add(option.value);
                        }
                        onSelectionChange(newSelectedValues);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4  items-center justify-center rounded-sm border border-calypso-700",
                          isSelected
                            ? "bg-calypso-200/50 text-calypso-700"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {groupedOptions &&
              Object.entries(groupedOptions).map(
                ([groupName, groupOptions]) => (
                  <CommandGroup key={groupName} heading={groupName}>
                    {groupOptions.map((option) => {
                      const isSelected = selectedValues.has(option.value);
                      return (
                        <CommandItem
                          key={option.value}
                          onSelect={() => {
                            const newSelectedValues = new Set(selectedValues);
                            if (isSelected) {
                              newSelectedValues.delete(option.value);
                            } else {
                              newSelectedValues.add(option.value);
                            }
                            onSelectionChange(newSelectedValues);
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4  items-center justify-center rounded-sm border border-calypso-700",
                              isSelected
                                ? "bg-calypso-200/50 text-calypso-700"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <CheckIcon className={cn("h-4 w-4")} />
                          </div>
                          {option.icon && (
                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{option.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
