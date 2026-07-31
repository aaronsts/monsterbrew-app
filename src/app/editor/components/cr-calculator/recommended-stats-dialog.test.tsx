import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithForm } from "../test-utils";
import { RecommendedStatsDialog } from "./recommended-stats-dialog";
import { setCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

const cr5: Monster["cr"] = {
  ...defaultMonster.cr,
  challenge_rating: "5",
  proficiency_bonus: 3,
};

beforeEach(() => setCrSuggestionsEnabled(true));

describe("RecommendedStatsDialog", () => {
  it("shows the CR 5 benchmark row when opened", async () => {
    const user = userEvent.setup();
    renderWithForm(<RecommendedStatsDialog />, { cr: cr5 });

    await user.click(
      screen.getByRole("button", { name: /Recommended stats/ }),
    );

    expect(screen.getByText("Recommended stats for CR 5")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy(); // AC / save DC
    expect(screen.getByText("95 (71–119)")).toBeTruthy(); // HP with range
    expect(screen.getByText("+7")).toBeTruthy(); // attack bonus
    expect(screen.getByText("+4")).toBeTruthy(); // +7 minus the +3 PB
    expect(screen.getByText(/vampire spawn/)).toBeTruthy(); // examples
    // The fine print explaining what the comparisons rely on.
    expect(
      screen.getByText(/projected from the best ability score/),
    ).toBeTruthy();
  });

  it("renders no trigger when the CR has no benchmark row", () => {
    renderWithForm(<RecommendedStatsDialog />, {
      cr: { ...defaultMonster.cr, challenge_rating: "" },
    });
    expect(
      screen.queryByRole("button", { name: /Recommended stats/ }),
    ).toBeNull();
  });
});
