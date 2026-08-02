"use client";

import {
  AbilityOrNumberControl,
  DamageTypeControl,
  FieldRow,
  OptionSelect,
} from "./controls";
import type { AttackFields } from "@/lib/statblock-markup";
import type { TokenEditorProps } from "./index";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { hitBonus } from "@/lib/statblock-markup";
import { blockMinusKey, formatMod } from "@/lib/utils";

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
  ctx,
}: Readonly<TokenEditorProps<AttackFields>>) {
  const distance = splitDistance(value.kind, value.reach);
  const set = (patch: Partial<AttackFields>) =>
    onChange({ ...value, ...patch });
  const setDistance = (patch: Partial<Distance>) =>
    set({ reach: joinDistance(value.kind, { ...distance, ...patch }) });
  const melee = /m/.test(value.kind);
  const ranged = /r/.test(value.kind);

  return (
    <div className="grid gap-3">
      <FieldRow label="Attack kind">
        <OptionSelect
          items={KIND_OPTIONS}
          value={value.kind}
          onChange={(kind) =>
            set({ kind, reach: joinDistance(kind, distance) })
          }
        />
      </FieldRow>
      <div className="grid md:grid-cols-2 gap-3">
        <AbilityOrNumberControl
          label="To hit"
          value={value.hit}
          onChange={(hit) => set({ hit })}
          hint={value.hit ? formatMod(hitBonus(value.hit, ctx)) : undefined}
        />
        <div className="grid auto-cols-fr grid-flow-col gap-3">
          {melee && (
            <FieldRow label="Reach">
              <Input
                type="number"
                min={0}
                onKeyDown={blockMinusKey}
                aria-label="Reach in feet"
                value={distance.melee}
                onChange={(e) => setDistance({ melee: e.target.value })}
                className="h-8"
              />
            </FieldRow>
          )}
          {ranged && (
            <>
              <FieldRow label="Range">
                <Input
                  type="number"
                  min={0}
                  onKeyDown={blockMinusKey}
                  aria-label="Normal range in feet"
                  value={distance.normal}
                  onChange={(e) => setDistance({ normal: e.target.value })}
                  className="h-8"
                />
              </FieldRow>
              <FieldRow label="Long">
                <Input
                  type="number"
                  min={0}
                  onKeyDown={blockMinusKey}
                  aria-label="Long range in feet"
                  value={distance.long}
                  onChange={(e) => setDistance({ long: e.target.value })}
                  className="h-8"
                />
              </FieldRow>
            </>
          )}
        </div>
      </div>
      <Separator />

      <div className="grid md:grid-cols-2 w-full gap-3">
        <FieldRow label="Damage on hit">
          <div className="flex gap-1.5">
            <Input
              aria-label="Damage dice"
              value={value.dice}
              onChange={(e) => set({ dice: e.target.value })}
              placeholder="1d6 + str"
              className="h-8 min-w-16 flex-1"
            />
            <DamageTypeControl
              value={value.type}
              onChange={(type) => set({ type })}
              className="w-28 shrink-0"
            />
          </div>
        </FieldRow>
        <FieldRow label="Extra damage" optional>
          <div className="flex gap-1.5">
            <Input
              aria-label="Extra damage dice"
              value={value.dice2}
              onChange={(e) => {
                const dice2 = e.target.value;
                set(dice2.trim() ? { dice2 } : { dice2, type2: "" });
              }}
              className="h-8 min-w-16 flex-1"
            />
            <DamageTypeControl
              value={value.type2}
              onChange={(type2) => set({ type2 })}
              className="w-28 shrink-0"
            />
          </div>
        </FieldRow>
      </div>
      <FieldRow label="Effect on hit" optional>
        <Input
          aria-label="Hit effect text"
          value={value.effect}
          onChange={(e) => set({ effect: e.target.value })}
          placeholder="ex. target has the {@condition grappled} condition (escape DC 14)"
          className="h-8"
        />
      </FieldRow>
    </div>
  );
}
