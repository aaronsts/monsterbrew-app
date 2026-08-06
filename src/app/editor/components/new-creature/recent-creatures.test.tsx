import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecentCreatures } from "./recent-creatures";
import type { StoredMonster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { useCreatures } from "@/hooks/use-creatures";

vi.mock("@/hooks/use-creatures", () => ({ useCreatures: vi.fn() }));

function stored(
  id: string,
  name: string,
  updated_at?: number,
): StoredMonster {
  return { ...defaultMonster, id, name, updated_at };
}

/** Stub the query hook with just the fields `RecentCreatures` reads. */
function mockStore({
  data,
  isPending = false,
}: {
  data?: Array<StoredMonster>;
  isPending?: boolean;
}) {
  vi.mocked(useCreatures).mockReturnValue({
    data,
    isPending,
  } as ReturnType<typeof useCreatures>);
}

describe("RecentCreatures", () => {
  it("lists saved creatures, most recently touched first", () => {
    mockStore({
      data: [
        stored("1-a", "Owlbear", 3_000),
        stored("2-b", "Fen Hag", 9_000),
      ],
    });

    render(<RecentCreatures onPick={vi.fn()} />);

    const rows = screen.getAllByRole("button");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("Fen Hag"),
      expect.stringContaining("Owlbear"),
    ]);
  });

  it("shows at most four creatures", () => {
    mockStore({
      data: Array.from({ length: 7 }, (_, i) =>
        stored(`${i}-x`, `Creature ${i}`, i * 1_000),
      ),
    });

    render(<RecentCreatures onPick={vi.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("renders nothing while the store is still loading", () => {
    mockStore({ data: undefined, isPending: true });

    const { container } = render(<RecentCreatures onPick={vi.fn()} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no creatures are saved", () => {
    mockStore({ data: [] });

    const { container } = render(<RecentCreatures onPick={vi.fn()} />);

    expect(container.innerHTML).toBe("");
  });

  it("hands the creature's id to onPick when a row is clicked", async () => {
    mockStore({ data: [stored("owlbear-id", "Owlbear", 3_000)] });
    const onPick = vi.fn();

    render(<RecentCreatures onPick={onPick} />);
    await userEvent.click(screen.getByRole("button", { name: /Owlbear/ }));

    expect(onPick).toHaveBeenCalledWith("owlbear-id");
  });
});
