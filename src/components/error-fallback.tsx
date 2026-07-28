import { Link, useRouter } from "@tanstack/react-router";
import { Home, RefreshCw } from "lucide-react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CornerBrackets } from "@/components/home/corner-brackets";

/**
 * Shared error page visual, used by the router's defaultErrorComponent and
 * the standalone /error route. Errors reaching this UI are reported to
 * Sentry separately via defaultOnCatch in router.tsx.
 */
export function ErrorFallback({
  error,
  onRetry,
}: {
  error?: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof Error ? error.message : error ? String(error) : undefined;

  return (
    <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-25 mask-[radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <CornerBrackets color="border-destructive/70" size="size-8" />
      <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-destructive-500 uppercase">
        <span aria-hidden className="size-1.5 bg-destructive-500" />
        Error
      </p>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Something went wrong
      </h1>
      <p className="max-w-md text-lg text-muted-foreground text-balance">
        The app hit an unexpected error. It has been logged so it can be fixed.
        Your creatures are safe in your browser.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
        <Link to="/">
          <Button color="neutral" variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back home
          </Button>
        </Link>
      </div>
      {message && (
        <details className="mt-6 w-full max-w-md text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Technical details
          </summary>
          <pre className="mt-2 overflow-x-auto border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            {message}
            {import.meta.env.DEV && error instanceof Error && error.stack
              ? `\n\n${error.stack}`
              : null}
          </pre>
        </details>
      )}
    </section>
  );
}

export function RouterErrorFallback({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <ErrorFallback
      error={error}
      onRetry={() => {
        reset();
        router.invalidate();
      }}
    />
  );
}
