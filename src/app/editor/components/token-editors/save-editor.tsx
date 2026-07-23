"use client";

import { useState } from "react";
import {
  AbilityOrNumberControl,
  DamageTypeSelect,
  FieldRow,
  OptionSelect,
} from "./controls";
import { ABILITY_OPTIONS } from "./options";
import type { SaveFields } from "@/lib/statblock-markup";
import type { TokenEditorProps } from "./index";
import { Input } from "@/components/ui/input";

const ON_SAVE_OPTIONS = [
  { value: "half", label: "Half damage" },
  { value: "none", label: "No success clause" },
  { value: "custom", label: "Custom text" },
];

export function SaveEditor({
  value,
  onChange,
}: Readonly<TokenEditorProps<SaveFields>>) {
  const set = (patch: Partial<SaveFields>) => onChange({ ...value, ...patch });
  // UI-only: keeps the custom input visible while its text is still empty or
  // happens to spell a keyword. The token stays the source of truth.
  const [forcedCustom, setForcedCustom] = useState(false);

  const effectiveOnSave = value.onSave || (value.dice ? "half" : "none");
  const isKeyword = effectiveOnSave === "half" || effectiveOnSave === "none";
  const mode = forcedCustom || !isKeyword ? "custom" : effectiveOnSave;

  return (
    <div className="grid gap-2.5">
      <FieldRow label="Saving throw">
        <OptionSelect
          items={ABILITY_OPTIONS}
          value={value.ability.toLowerCase()}
          onChange={(ability) => set({ ability })}
        />
      </FieldRow>
      <AbilityOrNumberControl
        label="DC"
        value={value.dc}
        onChange={(dc) => set({ dc })}
      />
      <FieldRow label="Damage dice (on failure)">
        <Input
          aria-label="Failure damage dice"
          value={value.dice}
          onChange={(e) => set({ dice: e.target.value })}
          placeholder="3d6"
          className="h-8"
        />
      </FieldRow>
      <DamageTypeSelect value={value.type} onChange={(type) => set({ type })} />
      <FieldRow label="On success">
        <OptionSelect
          items={ON_SAVE_OPTIONS}
          value={mode}
          onChange={(v) => {
            if (v === "custom") {
              setForcedCustom(true);
              set({ onSave: "" });
            } else {
              setForcedCustom(false);
              set({ onSave: v });
            }
          }}
        />
      </FieldRow>
      {mode === "custom" && (
        <Input
          aria-label="Custom success text"
          value={isKeyword && forcedCustom ? "" : value.onSave}
          onChange={(e) => set({ onSave: e.target.value })}
          placeholder="the target is {@condition prone}"
        />
      )}
    </div>
  );
}
