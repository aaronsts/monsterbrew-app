"use client";

import { useId } from "react";
import { ABILITY_OPTIONS } from "./options";
import type { SelectOption } from "./options";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DAMAGE_TYPES } from "@/types/types";

const ABILITY_VALUES = new Set(ABILITY_OPTIONS.map((o) => o.value));

export function FieldRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid w-full gap-1", className)}>
      <Label className="w-fit text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

interface OptionSelectProps {
  items: Array<SelectOption>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Segmented radio row: one compact bordered chip per option, selection
 * styled by FieldLabel's `has-data-checked` rules. The hidden radio keeps
 * keyboard/group semantics.
 */
export function OptionSelect({
  items,
  value,
  onChange,
}: Readonly<OptionSelectProps>) {
  // Several OptionSelects share one popover; prefix the option ids so each
  // label toggles its own group instead of the first group using that value.
  const groupId = useId();
  const allItems = items.some((o) => o.value === value)
    ? items
    : [{ value, label: value || "—" }, ...items];

  return (
    <RadioGroup
      className="flex w-full flex-wrap gap-1"
      value={value}
      onValueChange={(v) => onChange(v)}
    >
      {allItems.map((option) => (
        <FieldLabel
          key={option.value}
          htmlFor={`${groupId}-${option.value}`}
          className="h-7 min-w-fit flex-1 items-center justify-center rounded-none border px-1.5 text-[11px] whitespace-nowrap"
        >
          {option.label}
          <RadioGroupItem
            className="hidden"
            value={option.value}
            id={`${groupId}-${option.value}`}
          />
        </FieldLabel>
      ))}
    </RadioGroup>
  );
}

/** Dropdown variant for long option lists (radio chips would sprawl). */
export function SelectControl({
  items,
  value,
  onChange,
  className,
}: Readonly<OptionSelectProps>) {
  const allItems = items.some((o) => o.value === value)
    ? items
    : [{ value, label: value || "—" }, ...items];

  return (
    <Select
      items={allItems}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allItems.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const FLAT = "__flat";

interface AbilityOrNumberControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * The flat-or-ability slot shared by to-hit and DC: the stored value is
 * either an ability keyword ("derive live from stats") or a flat number.
 */
export function AbilityOrNumberControl({
  label,
  value,
  onChange,
}: Readonly<AbilityOrNumberControlProps>) {
  const isAbilityValue = ABILITY_VALUES.has(value.toLowerCase());
  const mode = isAbilityValue ? value.toLowerCase() : FLAT;
  const items = [...ABILITY_OPTIONS, { value: FLAT, label: "Custom" }];
  const isZero = /^\d+$/.test(value) ? value : "0";
  return (
    <FieldRow label={label}>
      <div className="flex flex-col items-start gap-1.5">
        <div className="min-w-0 w-full flex-1">
          <OptionSelect
            items={items}
            value={mode}
            onChange={(v) => onChange(v === FLAT ? isZero : v)}
          />
        </div>
        {mode === FLAT && (
          <Input
            type="number"
            aria-label={`${label} value`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-full"
          />
        )}
      </div>
    </FieldRow>
  );
}

const NO_TYPE = "__none";

export function DamageTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const items = [
    { value: NO_TYPE, label: "None" },
    ...DAMAGE_TYPES.map((t) => ({
      value: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
    })),
  ];
  return (
    <FieldRow label="Damage type">
      <SelectControl
        items={items}
        value={value || NO_TYPE}
        onChange={(v) => onChange(v === NO_TYPE ? "" : v)}
        className="h-8"
      />
    </FieldRow>
  );
}
