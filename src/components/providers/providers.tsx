"use client";

import PlausibleProvider from "next-plausible";
import { PropsWithChildren } from "react";
import { ReactQueryClientProvider } from "./ReactQueryClientProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <PlausibleProvider domain="monsterbrew-app.vercel.app">
      <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
    </PlausibleProvider>
  );
}
