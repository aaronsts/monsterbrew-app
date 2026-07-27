import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StandAloneDescription } from "@/components/ui/stand-alone-description";

describe("StandAloneDescription", () => {
  it("renders the title as bold-italic ahead of the description", () => {
    const { container } = render(
      <StandAloneDescription title="Bite" description="Melee attack." />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("Bite.");
    expect(container.textContent).toContain("Melee attack.");
  });

  it("keeps the emphasis intact when the title has stray whitespace", () => {
    // "*** Bite.***" violates CommonMark flanking rules and would render
    // literal asterisks.
    const { container } = render(
      <StandAloneDescription title=" Bite " description="Melee attack." />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("Bite.");
    expect(container.textContent).not.toContain("*");
  });

  it("keeps the emphasis intact when the description has stray whitespace", () => {
    const { container } = render(
      <StandAloneDescription title="Bite" description="  Melee attack.  " />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("Bite.");
    expect(container.textContent).not.toContain("*");
  });

  it("does not turn indented description lines into code blocks", () => {
    const { container } = render(
      <StandAloneDescription
        title="Bite"
        description={"First hit.\n\n    Second hit."}
      />,
    );
    expect(container.querySelector("code")).toBeNull();
    expect(container.textContent).toContain("Second hit.");
  });
});
