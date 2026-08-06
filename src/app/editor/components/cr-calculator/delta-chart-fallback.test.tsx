import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../test-utils";
import { setCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

// Stand in for the chunk failing to fetch — a deploy rotating hashed assets
// under an editor tab that has been open a while. Lives in its own file because
// the mock has to apply to the whole module graph.
vi.mock("./delta-chart-body", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

const cr5: Monster["cr"] = {
  ...defaultMonster.cr,
  challenge_rating: "5",
  proficiency_bonus: 3,
};

beforeEach(() => setCrSuggestionsEnabled(true));

describe("DeltaChart when the chart chunk fails to load", () => {
  /**
   * Nothing sits between this Suspense boundary and the router's
   * `defaultErrorComponent`, so an uncaught rejection here unmounts MonsterForm
   * and takes an unsaved creature with it. The chart has to degrade in place.
   */
  it("degrades to a message instead of throwing to the router", async () => {
    const user = userEvent.setup();
    const { DeltaChart } = await import("./delta-chart");
    renderWithForm(<DeltaChart />, { cr: cr5 });

    await user.click(screen.getByText("Benchmark deltas"));

    expect(await screen.findByText(/couldn't be loaded/i)).toBeTruthy();
    // The accessible summary carries the same numbers, so the data is not lost.
    expect(screen.getByText(/Armor class:/)).toBeTruthy();
  });
});
