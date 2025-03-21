import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import "@fontsource/yatra-one";
import MainNavigation from "@/components/main-navigation";
import { ReactQueryClientProvider } from "@/components/providers/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/sonner";

const nippo = localFont({
  src: "./fonts/Nippo-Variable.ttf",
  variable: "--font-nippo",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monsterbrew | Homebrewing creatures with ease",
  description:
    "Create custom 5e Dungeons & Dragons creatures effortlessly with an intuitive D&D homebrew tool!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body
          className={`${nippo.variable} font-nippo bg-background text-foreground antialiased`}
        >
          <MainNavigation />
          <main className="max-w-8xl mx-auto w-full">{children}</main>
          <Toaster richColors position="bottom-right" />
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
