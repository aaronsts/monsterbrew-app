"use client";

import { useState } from "react";
import {
  AbilityOrNumberControl,
  DamageTypeControl,
  FieldRow,
  OptionSelect,
} from "./controls";
import type { SaveFields } from "@/lib/statblock-markup";
import type { TokenEditorProps } from "./index";
import { dcValue } from "@/lib/statblock-markup";
import { Input } from "@/components/ui/input";
import { ABILITY_OPTIONS } from "@/lib/abilities";
import { Separator } from "@/components/ui/separator";

const ON_SAVE_OPTIONS = [
  { value: "half", label: "Half dmg" },
  { value: "none", label: "None" },
  { value: "custom", label: "Custom" },
];

export function SaveEditor({
  value,
  onChange,
  ctx,
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
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow label="Players roll">
          <OptionSelect
            items={ABILITY_OPTIONS}
            value={value.ability.toLowerCase()}
            onChange={(ability) => set({ ability })}
          />
        </FieldRow>
        <AbilityOrNumberControl
          label="DC comes from"
          value={value.dc}
          onChange={(dc) => set({ dc })}
          hint={value.dc ? `DC ${dcValue(value.dc, ctx)}` : undefined}
        />
      </div>
      <FieldRow label="Targets" optional>
        <Input
          aria-label="Save targets"
          value={value.target}
          onChange={(e) => set({ target: e.target.value })}
          placeholder="each creature in a 30-foot Cone"
          className="h-8"
        />
      </FieldRow>
      <Separator />
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow label="Damage on failure">
          <div className="flex gap-1.5">
            <Input
              aria-label="Failure damage dice"
              value={value.dice}
              onChange={(e) => {
                const dice = e.target.value;
                // Clearing the dice tidies the dependent slots: a dangling
                // "half" would still render "Success: Half damage.", and a
                // typed damage type would be left orphaned in the args.
                const patch = dice.trim()
                  ? { dice }
                  : {
                      dice,
                      type: "",
                      onSave: value.onSave === "half" ? "" : value.onSave,
                    };
                set(patch);
              }}
              placeholder="3d6"
              className="h-8 min-w-16 flex-1"
            />
            <DamageTypeControl
              value={value.type}
              onChange={(type) => set({ type })}
              className="w-28 shrink-0"
            />
          </div>
        </FieldRow>
        <FieldRow label="Extra effect on failure" optional>
          <Input
            aria-label="Failure effect text"
            value={value.fail}
            onChange={(e) => set({ fail: e.target.value })}
            placeholder="the target has the {@condition prone} condition"
            className="h-8"
          />
        </FieldRow>
      </div>
      <Separator />
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow label="On success">
          <OptionSelect
            items={onSaveOptions}
            value={mode}
            className="h-8"
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
          {mode === "custom" && (
            <Input
              aria-label="Custom success text"
              value={isKeyword && forcedCustom ? "" : value.onSave}
              onChange={(e) => set({ onSave: e.target.value })}
              placeholder="the target is {@condition prone}"
              className="h-8"
            />
          )}
        </FieldRow>
        <FieldRow label="Applies either way" optional>
          <Input
            aria-label="Failure or Success text"
            value={value.epilogue}
            onChange={(e) => set({ epilogue: e.target.value })}
            placeholder="The target can't be affected again for 24 hours"
            className="h-8"
          />
        </FieldRow>
      </div>
    </div>
  );
}
