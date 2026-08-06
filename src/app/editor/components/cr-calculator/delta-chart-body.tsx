"use client";

import type { DeltaBarDatum } from "@/components/delta-bar-chart";
import { DeltaBarChart, DeltaBarLegend } from "@/components/delta-bar-chart";

export default function DeltaChartBody({
  data,
}: Readonly<{ data: Array<DeltaBarDatum> }>) {
  return (
    <>
      <DeltaBarChart data={data} max={3} showBand className="lg:aspect-4/1" />
      <DeltaBarLegend baselineLabel="CR benchmark; within ±1 counts as on par" />
    </>
  );
}
