import * as Sentry from "@sentry/react";

if (typeof window !== "undefined" && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.DEV ? "development" : "production",
    sendDefaultPii: false,
    beforeBreadcrumb: (breadcrumb) =>
      breadcrumb.category === "console" ? null : breadcrumb,
  });
}
