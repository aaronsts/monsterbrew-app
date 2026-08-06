import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageSkeleton } from "./page-skeleton";

describe("PageSkeleton", () => {
  it("announces itself as a busy region", () => {
    render(<PageSkeleton label="Loading the component library…" />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.textContent).toContain("Loading the component library");
  });

  it("renders a heading block and body rows", () => {
    const { container } = render(<PageSkeleton label="Loading…" />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(2);
  });
});
