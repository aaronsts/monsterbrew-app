import { useState } from "react";
import { DeltaBarChart, DeltaBarLegend } from "@/components/delta-bar-chart";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CHART_STATS = [
  { key: "dmg", label: "Dmg per round", statName: "damage per round" },
  { key: "atk", label: "Atk. bonus", statName: "attack bonus" },
  { key: "ac", label: "Armor class", statName: "AC and save DC" },
  { key: "hp", label: "Hit points", statName: "hit points" },
  { key: "spd", label: "Speed", statName: "speed" },
  { key: "spc", label: "Abilities", statName: "special abilities" },
] as const;

type StatKey = (typeof CHART_STATS)[number]["key"];

type StatDelta = -2 | -1 | 0 | 1 | 2;

const COMBAT_ROLES: Array<{
  name: string;
  tooltip: string;
  stats: Record<StatKey, StatDelta>;
}> = [
  {
    name: "Ambusher",
    tooltip:
      "Hides, strikes, and hides again. Hits harder than the CR baseline, with lower HP and AC in exchange.",
    stats: { dmg: 2, atk: 0, ac: -1, hp: -1, spd: 0, spc: 1 },
  },
  {
    name: "Artillery",
    tooltip:
      "Fights from range. Higher attack bonus and damage than the baseline, lower HP and AC. The classic glass cannon.",
    stats: { dmg: 1, atk: 1, ac: -1, hp: -1, spd: 0, spc: 0 },
  },
  {
    name: "Bruiser",
    tooltip:
      "Big melee damage. Above-baseline damage, and easier to hit or quicker to drop in exchange.",
    stats: { dmg: 1, atk: 0, ac: -1, hp: 0, spd: 0, spc: 0 },
  },
  {
    name: "Controller",
    tooltip:
      "Imposes conditions: grapples, restrains, frightens, poisons. Lower damage than the baseline, because the save DC does the work.",
    stats: { dmg: -1, atk: 0, ac: 0, hp: 0, spd: 0, spc: 2 },
  },
  {
    name: "Defender",
    tooltip:
      "Soaks hits and keeps enemies off its allies. Higher AC and HP than the baseline, lower damage.",
    stats: { dmg: -2, atk: 0, ac: 1, hp: 1, spd: 0, spc: 1 },
  },
  {
    name: "Leader",
    tooltip:
      "Heals, buffs, or repositions its allies. Its own damage sits below the baseline; the allies make up the difference.",
    stats: { dmg: -1, atk: 0, ac: 0, hp: 0, spd: 0, spc: 2 },
  },
  {
    name: "Skirmisher",
    tooltip:
      "Darts in and out of the fight. More speed and mobility than the baseline, less HP.",
    stats: { dmg: 0, atk: 0, ac: 0, hp: -1, spd: 1, spc: 1 },
  },
];

function describeStats(stats: Record<StatKey, StatDelta>): string {
  const names = (matches: (delta: StatDelta) => boolean) =>
    CHART_STATS.filter((stat) => matches(stats[stat.key]))
      .map((stat) => stat.statName)
      .join(", ");
  const parts: Array<string> = [];
  const above = names((delta) => delta > 0);
  const below = names((delta) => delta < 0);
  if (above) parts.push(`Above the CR baseline: ${above}.`);
  if (below) parts.push(`Below: ${below}.`);
  parts.push("Other stats at the baseline.");
  return parts.join(" ");
}

type RoleChartDatum = {
  stat: string;
  statName: string;
  delta: StatDelta;
};

function roleChartData(
  stats: Record<StatKey, StatDelta>,
): Array<RoleChartDatum> {
  return CHART_STATS.map((stat) => ({
    stat: stat.label,
    statName: stat.statName,
    delta: stats[stat.key],
  }));
}

export function CombatRolesChart() {
  const [selected, setSelected] = useState(COMBAT_ROLES[0]);
  return (
    <div className="mb-6">
      <p className="mt-3 text-sm text-muted-foreground">{selected.tooltip}</p>
      <DeltaBarChart data={roleChartData(selected.stats)} max={2} />
      <DeltaBarLegend baselineLabel="baseline CR" className="mb-3" />
      <p className="sr-only">{describeStats(selected.stats)}</p>
      <ul className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {COMBAT_ROLES.map((role) => (
          <li key={role.name} className="w-full list-none">
            <Button
              type="button"
              color="accent"
              variant="outline"
              size="sm"
              aria-pressed={role.name === selected.name}
              onClick={() => setSelected(role)}
              className={cn(
                "w-full",
                role.name === selected.name && "bg-accent/20",
              )}
            >
              {role.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
