import {
  Bar,
  BarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import type { BarShapeProps } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export type DeltaBarDatum = {
  stat: string;
  delta: number;
};

const DELTA_CHART_CONFIG = {
  delta: { label: "vs CR baseline" },
} satisfies ChartConfig;

function deltaBarShape(props: BarShapeProps) {
  const { x = 0, y = 0, width = 0, height } = props;
  if (!height) {
    return (
      <rect
        x={x}
        y={y - 1}
        width={width}
        height={2}
        className="fill-neutral-300 dark:fill-neutral-500"
      />
    );
  }
  const { delta } = props.payload as DeltaBarDatum;
  // Same mapping as the CR hint chips: red for high/above, blue for low/below.
  return (
    <Rectangle
      {...props}
      className={cn(
        delta > 0
          ? "fill-destructive-300 dark:fill-destructive-500"
          : "fill-info-300 dark:fill-info-500",
      )}
    />
  );
}

export function DeltaBarChart({
  data,
  max,
  showBand = false,
  className,
}: Readonly<{
  data: Array<DeltaBarDatum>;
  /** Largest |delta| shown; sets the symmetric axis domain and its ticks. */
  max: number;
  /** Faint guides at ±1 — the edge of "on par" for tolerance-unit data. */
  showBand?: boolean;
  className?: string;
}>) {
  const isMobile = useIsMobile();
  const ticks = Array.from({ length: 2 * max + 1 }, (_, i) => i - max);

  return (
    <ChartContainer
      aria-hidden
      config={DELTA_CHART_CONFIG}
      className={cn("aspect-square w-full sm:aspect-5/2", className)}
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
          domain={[-max - 0.25, max + 0.25]}
          ticks={ticks}
          interval={0}
          tick={{ fontSize: 10 }}
          tickFormatter={(value: number) =>
            value === 0 ? "CR" : value > 0 ? `+${value}` : `−${-value}`
          }
        />
        {showBand && (
          <ReferenceLine
            y={1}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.25}
            strokeDasharray="2 4"
          />
        )}
        <ReferenceLine
          y={0}
          stroke="var(--muted-foreground)"
          strokeOpacity={0.6}
          strokeDasharray="4 4"
        />
        {showBand && (
          <ReferenceLine
            y={-1}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.25}
            strokeDasharray="2 4"
          />
        )}
        <Bar dataKey="delta" maxBarSize={44} shape={deltaBarShape} />
      </BarChart>
    </ChartContainer>
  );
}

export function DeltaBarLegend({
  baselineLabel,
  className,
}: Readonly<{ baselineLabel: string; className?: string }>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="w-3 border-t border-dashed border-muted-foreground"
        />
        {baselineLabel}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-2.5 bg-destructive-300 dark:bg-destructive-500"
        />
        above
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2.5 bg-info-300 dark:bg-info-500" />
        below
      </span>
    </div>
  );
}
