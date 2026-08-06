/**
 * Sentry is loaded off the critical path.
 *
 * Only `init` and `captureException` are ever destructured off the dynamic
 * import, and nothing here hands the module namespace back out. That matters:
 * holding a reference to the namespace object defeats tree-shaking and pulls
 * the SDK's whole surface (replay, tracing, feedback) into the lazy chunk.
 *
 * The trade-off: errors thrown between first paint and the idle callback are
 * not reported. Those are overwhelmingly render errors, and the router's
 * `defaultOnCatch` routes them through `captureError` below, which loads the
 * SDK on demand — so they still arrive, just a beat later.
 */
let capture: ((error: unknown) => void) | null = null;
let loading: Promise<void> | null = null;

function enabled(): boolean {
  return typeof window !== "undefined" && !!import.meta.env.VITE_SENTRY_DSN;
}

function load(): Promise<void> {
  loading ??= import("@sentry/react").then(({ init, captureException }) => {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.DEV ? "development" : "production",
      sendDefaultPii: false,
      beforeBreadcrumb: (breadcrumb) =>
        breadcrumb.category === "console" ? null : breadcrumb,
    });
    capture = captureException;
  });
  return loading;
}

/** Start loading and initializing the SDK once the browser goes idle. */
export function initSentryWhenIdle(): void {
  if (!enabled()) return;
  const schedule =
    window.requestIdleCallback ??
    ((callback: () => void) => window.setTimeout(callback, 2_000));
  schedule(() => {
    void load();
  });
}

/** Report an error, pulling the SDK in on demand if idle has not fired yet. */
export function captureError(error: unknown): void {
  if (!enabled()) return;
  void load().then(() => capture?.(error));
}
