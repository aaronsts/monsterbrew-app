import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LibraryGridSkeleton } from "./library-grid-skeleton";

describe("LibraryGridSkeleton", () => {
  it("announces itself as a busy region", () => {
    render(<LibraryGridSkeleton />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.textContent).toContain("Loading your library");
  });

  it("stands in for the header, the filters and the card grid", () => {
    const { container } = render(<LibraryGridSkeleton />);

    // Mirrors library-grid.tsx: heading block, source toggle, filter bar, then
    // the card grid. A placeholder covering only part of it reflows when the
    // real UI lands, which is the flash it exists to prevent.
    expect(container.querySelector('[data-testid="library-skeleton-header"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="library-skeleton-filters"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="library-skeleton-grid"]')).toBeTruthy();
  });

  it("uses the shared Skeleton primitive", () => {
    const { container } = render(<LibraryGridSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(4);
  });
});
