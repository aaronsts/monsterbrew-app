import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EditorSkeleton } from "./editor-skeleton";

afterEach(cleanup);

const skeletons = (container: HTMLElement) =>
  container.querySelectorAll('[data-slot="skeleton"]');

describe("EditorSkeleton", () => {
  it("announces itself as a busy region", () => {
    render(<EditorSkeleton />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.textContent).toContain("Loading the editor");
  });

  it("stands in for both halves of the editor", () => {
    const { container } = render(<EditorSkeleton />);

    expect(
      container.querySelector('[data-testid="editor-skeleton-form"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="editor-skeleton-preview"]'),
    ).toBeTruthy();
  });

  it("uses the shared Skeleton primitive rather than bespoke pulsing divs", () => {
    const { container } = render(<EditorSkeleton />);

    expect(skeletons(container).length).toBeGreaterThan(4);
  });
});
