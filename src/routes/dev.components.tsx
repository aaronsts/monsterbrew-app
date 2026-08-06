import { createFileRoute } from "@tanstack/react-router";
import { PageSkeleton } from "@/components/page-skeleton";
import { ComponentLibrary } from "@/app/dev/components/component-library";
import { isLocalhost, redirectUnlessLocalhost } from "@/lib/dev-route";

export const Route = createFileRoute("/dev/components")({
  // Client-only, localhost-only: a visual inventory of the design system for
  // development. On any other host the route redirects home.
  ssr: false,
  beforeLoad: redirectUnlessLocalhost,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  pendingComponent: () => (
    <PageSkeleton label="Loading the component library…" />
  ),
  pendingMinMs: 0,
  component: DevComponents,
});

function DevComponents() {
  if (!isLocalhost()) return null;
  return <ComponentLibrary />;
}
