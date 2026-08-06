import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DeltaChartBody from "./delta-chart-body";

describe("DeltaChartBody", () => {
  /**
   * Chart and legend have to sit behind the same lazy boundary (#158) — leaving
   * either one statically imported keeps `delta-bar-chart`, and recharts with
   * it, in the editor's preload graph. Asserting both render from this one
   * module is what pins them together.
   */
  it("renders the chart and its legend from one module", () => {
    const { container } = render(
      <DeltaChartBody data={[{ stat: "Armor class", delta: 1 }]} />,
    );

    expect(container.querySelector("svg")).toBeTruthy();
    expect(screen.getByText(/within ±1 counts as on par/)).toBeTruthy();
  });
});
