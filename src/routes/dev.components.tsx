import { createFileRoute, redirect } from "@tanstack/react-router";
import { ComponentLibrary } from "@/app/dev/components/component-library";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function isLocalhost() {
  return (
    typeof window !== "undefined" &&
    LOCAL_HOSTNAMES.has(window.location.hostname)
  );
}

export const Route = createFileRoute("/dev/components")({
  // Client-only, localhost-only: a visual inventory of the design system for
  // development. On any other host the route redirects home.
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isLocalhost()) {
      throw redirect({ to: "/" });
    }
  },
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
