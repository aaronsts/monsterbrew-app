"use client";

import {
  AbilityOrNumberControl,
  DamageTypeSelect,
  FieldRow,
  OptionSelect,
} from "./controls";
import type { AttackFields } from "@/lib/statblock-markup";
import type { TokenEditorProps } from "./index";
import { Input } from "@/components/ui/input";

const KIND_OPTIONS = [
  { value: "m", label: "Melee" },
  { value: "r", label: "Ranged" },
  { value: "m,r", label: "Melee or Ranged" },
];

interface Distance {
  melee: string;
  normal: string;
  long: string;
}

/** Decode the structured reach slot (`5`, `30/120`, `5;30/120`) per kind. */
function splitDistance(kind: string, reach: string): Distance {
  const melee = /m/.test(kind);
  const ranged = /r/.test(kind);
  if (melee && ranged) {
    const [near = "", far = ""] = reach.split(";").map((p) => p.trim());
    const [normal = "", long = ""] = far.split("/").map((p) => p.trim());
    return { melee: near, normal, long };
  }
  if (ranged) {
    const [normal = "", long = ""] = reach.split("/").map((p) => p.trim());
    return { melee: "", normal, long };
  }
  return { melee: reach, normal: "", long: "" };
}

function joinDistance(kind: string, d: Distance): string {
  const rangeType = d.long ? `${d.normal}/${d.long}` : d.normal;
  const range = d.normal ? rangeType : "";
  const melee = /m/.test(kind);
  const ranged = /r/.test(kind);
  if (melee && ranged) {
    if (!range) return d.melee;
    return `${d.melee};${range}`;
  }
  return ranged ? range : d.melee;
}

export function AttackEditor({
  value,
  onChange,
}: Readonly<TokenEditorProps<AttackFields>>) {
  const distance = splitDistance(value.kind, value.reach);
  const set = (patch: Partial<AttackFields>) =>
    onChange({ ...value, ...patch });
  const setDistance = (patch: Partial<Distance>) =>
    set({ reach: joinDistance(value.kind, { ...distance, ...patch }) });
  const melee = /m/.test(value.kind);
  const ranged = /r/.test(value.kind);

  return (
    <div className="grid gap-2.5">
      <FieldRow label="Attack kind">
        <OptionSelect
          items={KIND_OPTIONS}
          value={value.kind}
          onChange={(kind) =>
            set({ kind, reach: joinDistance(kind, distance) })
          }
        />
      </FieldRow>
      <AbilityOrNumberControl
        label="To hit"
        value={value.hit}
        onChange={(hit) => set({ hit })}
      />
      <div className="flex flex-wrap gap-2">
        {melee && (
          <FieldRow label="Reach (ft.)" className="w-16">
            <Input
              type="number"
              aria-label="Reach in feet"
              value={distance.melee}
              onChange={(e) => setDistance({ melee: e.target.value })}
              className="h-8"
            />
          </FieldRow>
        )}
        {ranged && (
          <>
            <FieldRow label="Range (ft.)" className="w-16">
              <Input
                type="number"
                aria-label="Normal range in feet"
                value={distance.normal}
                onChange={(e) => setDistance({ normal: e.target.value })}
                className="h-8"
              />
            </FieldRow>
            <FieldRow label="Long (ft.)" className="w-16">
              <Input
                type="number"
                aria-label="Long range in feet"
                value={distance.long}
                onChange={(e) => setDistance({ long: e.target.value })}
                className="h-8"
              />
            </FieldRow>
          </>
        )}
        <FieldRow label="Damage dice" className="min-w-24 flex-1">
          <Input
            aria-label="Damage dice"
            value={value.dice}
            onChange={(e) => set({ dice: e.target.value })}
            placeholder="1d6 + str"
            className="h-8"
          />
        </FieldRow>
      </div>
      <DamageTypeSelect value={value.type} onChange={(type) => set({ type })} />
    </div>
  );
}
