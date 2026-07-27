import { createFileRoute } from "@tanstack/react-router";
import { SentryTest } from "@/app/dev/components/sentry-test";
import { isLocalhost, redirectUnlessLocalhost } from "@/lib/dev-route";

export const Route = createFileRoute("/dev/sentry")({
  // Client-only, localhost-only: buttons that trigger each Sentry error path
  // for verifying the integration. On any other host the route redirects home.
  ssr: false,
  beforeLoad: redirectUnlessLocalhost,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: DevSentry,
});

function DevSentry() {
  if (!isLocalhost()) return null;
  return <SentryTest />;
}
