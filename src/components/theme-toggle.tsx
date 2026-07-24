"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // One-time mount flag so resolvedTheme is only read after hydration,
  // avoiding an SSR/client theme mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      variant="ghost"
      className={cn(
        "group relative grid size-9 place-items-center overflow-hidden",

        "transition-all duration-300 ease-out",

        "active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* Sun — visible in light mode */}
      <Sun
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 group-hover:rotate-45",
        )}
      />

      {/* Moon — visible in dark mode */}
      <Moon
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12"
            : "rotate-90 scale-0 opacity-0",
        )}
      />
    </Button>
  );
}
