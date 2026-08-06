import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/page-skeleton";
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
  pendingComponent: () => <PageSkeleton label="Loading the Sentry test page…" />,
  pendingMinMs: 0,
  component: DevSentry,
});

function DevSentry() {
  if (!isLocalhost()) return null;
  return <SentryTest />;
}
