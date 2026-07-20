"use client";

import PlausibleProvider from "next-plausible";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { ReactQueryClientProvider } from "./ReactQueryClientProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <PlausibleProvider domain="monsterbrew-app.vercel.app">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </ThemeProvider>
    </PlausibleProvider>
  );
}
