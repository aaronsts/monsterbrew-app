import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as MonsterSchemaModule from "@/schema/monster-schema";
import type { Monster } from "@/schema/monster-schema";
import { useAutoSave } from "@/hooks/use-auto-save";

const { mutateAsync, validRef } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  validRef: { valid: true },
}));

vi.mock("@/hooks/use-creatures", () => ({
  useAutoSaveCreature: () => ({ mutateAsync }),
}));

vi.mock("@/schema/monster-schema", async (importOriginal) => {
  const actual = await importOriginal<typeof MonsterSchemaModule>();
  return {
    ...actual,
    monsterSchema: {
      safeParse: (value: unknown) =>
        validRef.valid
          ? { success: true, data: value }
          : { success: false, error: { issues: [] } },
    },
  };
});

function useHarness(opts: { id: string | undefined; enabled: boolean }) {
  const form = useForm<Monster>({ defaultValues: { name: "" } as Monster });
  useAutoSave(form, { ...opts, delay: 800 });
  return form;
}

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mutateAsync.mockReset().mockResolvedValue({});
    validRef.valid = true;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not auto-save while the creature has no id", () => {
    const { result } = renderHook(() =>
      useHarness({ id: undefined, enabled: false }),
    );
    act(() => {
      result.current.setValue("name", "Goblin");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("auto-saves a valid change after the debounce, merging the id", async () => {
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    act(() => {
      result.current.setValue("name", "Goblin");
    });
    // Still within the debounce window.
    expect(mutateAsync).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: "abc", name: "Goblin" }),
    );
  });

  it("skips saving invalid form states", async () => {
    validRef.valid = false;
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    act(() => {
      result.current.setValue("name", "");
    });
    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("coalesces rapid changes into a single save", async () => {
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    act(() => {
      result.current.setValue("name", "a");
      vi.advanceTimersByTime(400);
      result.current.setValue("name", "ab");
      vi.advanceTimersByTime(400);
      result.current.setValue("name", "abc");
    });
    await act(async () => {
      vi.advanceTimersByTime(800);
      await Promise.resolve();
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ name: "abc" }),
    );
  });
});
