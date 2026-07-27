import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { RectangleProps } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
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

const ROLE_CHART_CONFIG = {
  delta: { label: "vs CR baseline" },
} satisfies ChartConfig;

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

/** Matches Tailwind's `sm` breakpoint, so the axis labels rotate on the same
    screens where the chart switches to its taller mobile aspect ratio. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

function deltaBarShape(props: RectangleProps) {
  const { x = 0, y = 0, width = 0, height } = props;
  if (!height) {
    return (
      <rect
        x={x}
        y={y - 1}
        width={width}
        height={2}
        fill="var(--neutral-300)"
      />
    );
  }
  return <Rectangle {...props} />;
}

function RoleChart({ stats }: Readonly<{ stats: Record<StatKey, StatDelta> }>) {
  const data = roleChartData(stats);
  const isMobile = useIsMobile();

  return (
    <ChartContainer
      aria-hidden
      config={ROLE_CHART_CONFIG}
      className="aspect-square w-full sm:aspect-5/2"
    >
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8 }}>
        <XAxis
          dataKey="stat"
          interval={0}
          tickLine={false}
          axisLine={false}
          height={isMobile ? 64 : 30}
          tick={
            isMobile
              ? { fontSize: 10, angle: -45, textAnchor: "end" }
              : { fontSize: 10 }
          }
        />
        <YAxis
          width={32}
          domain={[-2.25, 2.25]}
          ticks={[-2, -1, 0, 1, 2]}
          interval={0}
          tick={{ fontSize: 10 }}
          tickFormatter={(value: number) =>
            value === 0 ? "CR" : value > 0 ? `+${value}` : `−${-value}`
          }
        />
        <ReferenceLine
          y={0}
          stroke="var(--muted-foreground)"
          strokeOpacity={0.6}
          strokeDasharray="4 4"
        />
        <Bar dataKey="delta" maxBarSize={44} shape={deltaBarShape}>
          {data.map((entry) => (
            <Cell
              key={entry.stat}
              fill={
                entry.delta > 0 ? "var(--info-300)" : "var(--destructive-300)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function CombatRolesChart() {
  const [selected, setSelected] = useState(COMBAT_ROLES[0]);
  return (
    <div className="mb-6">
      <p className="mt-3 text-sm text-muted-foreground">{selected.tooltip}</p>
      <RoleChart stats={selected.stats} />
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="w-3 border-t border-dashed border-muted-foreground"
          />
          baseline CR
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 bg-info-300" />
          above
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 bg-destructive-300" />
          below
        </span>
      </div>
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
