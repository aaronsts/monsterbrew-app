"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { ReactQueryClientProvider } from "./ReactQueryClientProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </ThemeProvider>
  );
}
