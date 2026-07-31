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
  const autoSave = useAutoSave(form, {
    ...opts,
    delay: 800,
    minSavingTime: 1000,
  });
  return { form, autoSave };
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
      result.current.form.setValue("name", "Goblin");
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
      result.current.form.setValue("name", "Goblin");
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
      result.current.form.setValue("name", "");
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
      result.current.form.setValue("name", "a");
      vi.advanceTimersByTime(400);
      result.current.form.setValue("name", "ab");
      vi.advanceTimersByTime(400);
      result.current.form.setValue("name", "abc");
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

  it("holds the saving status for the minimum visible time", async () => {
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    act(() => {
      result.current.form.setValue("name", "Goblin");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    // The write itself resolves instantly, but the status must hold.
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.autoSave.status).toBe("saving");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(result.current.autoSave.status).toBe("saving");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(result.current.autoSave.status).toBe("saved");
  });
});
