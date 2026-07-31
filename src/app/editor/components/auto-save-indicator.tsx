import type { AutoSaveStatus } from "@/hooks/use-auto-save";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const statusText: Record<AutoSaveStatus, string | null> = {
  idle: null,
  saving: "Saving…",
  saved: "All changes saved",
  error: "Couldn’t save changes",
};

/** Subtle auto-save state readout for the editor toolbar (desktop only). */
export function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  return (
    <span
      className="mr-auto hidden items-center text-xs text-muted-foreground lg:flex"
      aria-live="polite"
    >
      {statusText[status]}
      {status === "saving" && <LoadingSpinner className="ml-2 size-4" />}
    </span>
  );
}
