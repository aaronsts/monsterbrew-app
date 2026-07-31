import type { AutoSaveStatus } from "@/hooks/use-auto-save";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const statusText: Record<AutoSaveStatus, string | null> = {
  idle: null,
  saving: "Saving…",
  saved: "All changes saved",
  error: "Couldn’t save changes",
};

export function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  return (
    <span
      className=" hidden items-center text-xs text-muted-foreground lg:flex"
      aria-live="polite"
    >
      {status === "saving" && <LoadingSpinner className="mr-3 size-4" />}
      {statusText[status]}
    </span>
  );
}
