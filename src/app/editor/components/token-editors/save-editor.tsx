"use client";

import { useState } from "react";
import {
  AbilityOrNumberControl,
  DamageTypeSelect,
  FieldRow,
  OptionSelect,
} from "./controls";
import type { SaveFields } from "@/lib/statblock-markup";
import type { TokenEditorProps } from "./index";
import { Input } from "@/components/ui/input";
import { ABILITY_OPTIONS } from "@/lib/abilities";
import { FieldDescription } from "@/components/ui/field";

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

  const hasDamage = value.dice.trim() !== "";
  const onSaveOptions = hasDamage
    ? ON_SAVE_OPTIONS
    : ON_SAVE_OPTIONS.filter((o) => o.value !== "half");

  return (
    <div className="grid gap-2.5">
      <FieldRow label="Saving throw">
        <OptionSelect
          items={ABILITY_OPTIONS}
          value={value.ability.toLowerCase()}
          onChange={(ability) => set({ ability })}
        />
        <FieldDescription>
          What the players need to save against
        </FieldDescription>
      </FieldRow>
      <AbilityOrNumberControl
        label="DC"
        value={value.dc}
        onChange={(dc) => set({ dc })}
      />
      <FieldRow label="Targets (after the DC, optional)">
        <Input
          aria-label="Save targets"
          value={value.target}
          onChange={(e) => set({ target: e.target.value })}
          placeholder="each creature in a 30-foot Cone"
          className="h-8"
        />
      </FieldRow>
      <FieldRow label="Damage dice (on failure, optional)">
        <Input
          aria-label="Failure damage dice"
          value={value.dice}
          onChange={(e) => {
            const dice = e.target.value;
            // A dangling "half" would still render "Success: Half damage."
            const patch =
              !dice.trim() && value.onSave === "half"
                ? { dice, onSave: "" }
                : { dice };
            set(patch);
          }}
          placeholder="3d6"
          className="h-8"
        />
      </FieldRow>
      {hasDamage && (
        <DamageTypeSelect
          value={value.type}
          onChange={(type) => set({ type })}
        />
      )}
      <FieldRow label="Failure effect (optional)">
        <Input
          aria-label="Failure effect text"
          value={value.fail}
          onChange={(e) => set({ fail: e.target.value })}
          placeholder="the target has the {@condition prone} condition"
          className="h-8"
        />
      </FieldRow>
      <FieldRow label="On success">
        <OptionSelect
          items={onSaveOptions}
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
      <FieldRow label="Failure or Success (optional)">
        <Input
          aria-label="Failure or Success text"
          value={value.epilogue}
          onChange={(e) => set({ epilogue: e.target.value })}
          placeholder="The target can't be affected again for 24 hours"
          className="h-8"
        />
      </FieldRow>
    </div>
  );
}
