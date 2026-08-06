import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CreatureDetailSkeleton } from "./creature-detail-skeleton";

afterEach(cleanup);

describe("CreatureDetailSkeleton", () => {
  it("announces itself as a busy region", () => {
    render(<CreatureDetailSkeleton />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.textContent).toContain("Loading the creature");
  });

  it("stands in for the action row and the statblock", () => {
    const { container } = render(<CreatureDetailSkeleton />);

    expect(
      container.querySelector('[data-testid="creature-detail-skeleton-actions"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="creature-detail-skeleton-statblock"]'),
    ).toBeTruthy();
  });
});
