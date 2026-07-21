"use client";

import { ThemeProvider } from "next-themes";
import { ReactQueryClientProvider } from "./ReactQueryClientProvider";
import type { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </ThemeProvider>
  );
}
