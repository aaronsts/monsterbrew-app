import { redirect } from "@tanstack/react-router";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function isLocalhost() {
  return (
    typeof window !== "undefined" &&
    LOCAL_HOSTNAMES.has(window.location.hostname)
  );
}

/** beforeLoad guard for localhost-only /dev routes: redirects home elsewhere. */
export function redirectUnlessLocalhost() {
  if (typeof window !== "undefined" && !isLocalhost()) {
    throw redirect({ to: "/" });
  }
}
