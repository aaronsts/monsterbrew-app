import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./filter-bar";

function renderBar(overrides: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  render(
    <FilterBar
      search=""
      onSearchChange={vi.fn()}
      typeFilter="all"
      onTypeChange={vi.fn()}
      cr={[]}
      onCrChange={vi.fn()}
      resultCount={0}
      totalCount={0}
      {...overrides}
    />,
  );
}

describe("FilterBar — CR multi-select combobox", () => {
  it("shows an 'Any CR' placeholder when nothing is selected", () => {
    renderBar();
    expect(screen.getByPlaceholderText("Any CR")).toBeDefined();
  });

  it("renders a chip per selected CR", () => {
    renderBar({ cr: ["1/4", "5"] });
    expect(screen.getByText("CR 1/4")).toBeDefined();
    expect(screen.getByText("CR 5")).toBeDefined();
  });
});
