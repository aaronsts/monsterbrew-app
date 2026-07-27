import { createFileRoute, redirect } from "@tanstack/react-router";
import { SentryTest } from "@/app/dev/components/sentry-test";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function isLocalhost() {
  return (
    typeof window !== "undefined" &&
    LOCAL_HOSTNAMES.has(window.location.hostname)
  );
}

export const Route = createFileRoute("/dev/sentry")({
  // Client-only, localhost-only: buttons that trigger each Sentry error path
  // for verifying the integration. On any other host the route redirects home.
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isLocalhost()) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: DevSentry,
});

function DevSentry() {
  if (!isLocalhost()) return null;
  return <SentryTest />;
}
