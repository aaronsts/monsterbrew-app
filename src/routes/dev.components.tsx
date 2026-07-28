import { createFileRoute } from "@tanstack/react-router";
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
  component: DevComponents,
});

// eslint-disable-next-line react-refresh/only-export-components
function DevComponents() {
  if (!isLocalhost()) return null;
  return <ComponentLibrary />;
}
