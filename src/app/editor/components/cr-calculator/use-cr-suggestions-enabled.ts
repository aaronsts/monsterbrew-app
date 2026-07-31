import { useSyncExternalStore } from "react";

/**
 * Editor-wide kill switch for the CR suggestions UI. The toggle in
 * `CrCalculator` and the inline `CrStatHint`s in the combat section are
 * sibling components, so this is a tiny module-level store (the same plain
 * `localStorage` idiom as `feedback-cta.tsx`, made observable via
 * `useSyncExternalStore`) rather than per-instance state — flipping the
 * switch updates every reader immediately, no remount or provider needed.
 */
const KEY = "monsterbrew:cr-suggestions-enabled";

const listeners = new Set<() => void>();
// Read lazily on the first client snapshot so SSR never touches localStorage.
let cached: boolean | null = null;

function getSnapshot(): boolean {
  cached ??= localStorage.getItem(KEY) !== "false";
  return cached;
}

function getServerSnapshot(): boolean {
  return true;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setCrSuggestionsEnabled(value: boolean): void {
  cached = value;
  localStorage.setItem(KEY, String(value));
  listeners.forEach((callback) => callback());
}

export function useCrSuggestionsEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
