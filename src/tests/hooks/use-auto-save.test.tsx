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

  it("ignores the cache echo of its own save", async () => {
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    act(() => {
      result.current.form.setValue("name", "Goblin");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.autoSave.status).toBe("saved");

    // Saving writes into the query cache, which resyncs the form with the
    // same values — that reset must not start a second "Saving…" cycle.
    act(() => {
      result.current.form.reset({ name: "Goblin" });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(result.current.autoSave.status).toBe("saved");
  });

  it("does not re-save already-persisted state after arming", async () => {
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    // A programmatic setValue that changes nothing (e.g. derived passive
    // perception recomputing after load) must not save the state back.
    act(() => {
      result.current.form.setValue("name", "");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(result.current.autoSave.status).toBe("idle");
  });

  it("adopts a late-arriving creature as baseline instead of saving it back", async () => {
    // Arm while the form is still invalid (no baseline yet)…
    validRef.valid = false;
    const { result } = renderHook(() =>
      useHarness({ id: "abc", enabled: true }),
    );
    validRef.valid = true;
    // …then the stored creature arrives as a whole-form reset, not an edit.
    act(() => {
      result.current.form.reset({ name: "Loaded Wyrm" });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mutateAsync).not.toHaveBeenCalled();

    // A real edit afterwards still saves.
    act(() => {
      result.current.form.setValue("name", "Loaded Wyrm, Renamed");
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Loaded Wyrm, Renamed" }),
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
