import { createRouter } from "@tanstack/react-router";
import { captureException } from "@sentry/react";
import { routeTree } from "./routeTree.gen";
import { RouterErrorFallback } from "@/components/error-fallback";

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",

    defaultOnCatch: (error) => captureException(error),
    defaultErrorComponent: RouterErrorFallback,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
