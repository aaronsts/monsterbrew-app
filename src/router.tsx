import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { captureError } from "@/lib/sentry";
import { RouterErrorFallback } from "@/components/error-fallback";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",

    defaultOnCatch: (error) => captureError(error),
    defaultErrorComponent: RouterErrorFallback,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
