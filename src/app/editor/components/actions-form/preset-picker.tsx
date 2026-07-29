"use client";

import { BookPlus } from "lucide-react";
import type { FeaturePreset } from "@/lib/constants/actionPresets";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxFilter,
} from "@/components/ui/combobox";

interface PresetPickerProps {
  presets: Array<FeaturePreset>;
  triggerLabel: string;
  onSelect: (preset: FeaturePreset) => void;
}

/** Searchable combobox for inserting a pre-defined feature into a list. */
export function PresetPicker({
  presets,
  triggerLabel,
  onSelect,
}: Readonly<PresetPickerProps>) {
  const filter = useComboboxFilter();

  return (
    <Combobox
      items={presets}
      itemToStringValue={(preset: FeaturePreset) => preset.label}
      filter={(preset: FeaturePreset, query: string) =>
        filter.contains(preset.label, query) ||
        filter.contains(preset.description, query)
      }
      onValueChange={(preset: FeaturePreset | null) => {
        if (preset) onSelect(preset);
      }}
    >
      <ComboboxTrigger
        render={
          <Button type="button" color="neutral" variant="outline" size="sm" />
        }
      >
        <BookPlus />
        {triggerLabel}
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search presets…" showTrigger={false} />
        <ComboboxEmpty>No presets found.</ComboboxEmpty>
        <ComboboxList>
          {(preset: FeaturePreset) => (
            <ComboboxItem key={preset.label} value={preset}>
              {preset.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
