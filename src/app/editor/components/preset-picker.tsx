"use client";

import { useState } from "react";
import { BookPlus } from "lucide-react";
import type { FeaturePreset } from "@/lib/constants/actionPresets";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface PresetPickerProps {
  presets: Array<FeaturePreset>;
  triggerLabel: string;
  onSelect: (preset: FeaturePreset) => void;
}

/** Searchable dialog for inserting a pre-defined feature into a list. */
export function PresetPicker({
  presets,
  triggerLabel,
  onSelect,
}: Readonly<PresetPickerProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        color="neutral"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <BookPlus />
        {triggerLabel}
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Insert preset"
        description="Search the pre-defined library and insert one into the creature."
      >
        <CommandInput placeholder="Search presets…" />
        <CommandList>
          <CommandEmpty>No presets found.</CommandEmpty>
          <CommandGroup>
            {presets.map((preset) => (
              <CommandItem
                key={preset.label}
                value={preset.label}
                keywords={[preset.description]}
                onSelect={() => {
                  onSelect(preset);
                  setOpen(false);
                }}
              >
                {preset.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
