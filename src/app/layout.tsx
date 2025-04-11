import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import "@fontsource/yatra-one";
import MainNavigation from "@/components/main-navigation";
import { ReactQueryClientProvider } from "@/components/providers/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { KofiLogo } from "@/components/images/KofiLogo";
import { Button } from "@/components/ui/button";
import { GithubLogo } from "@/components/images/GithubLogo";

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
      <html lang="en" className="h-full">
        <body
          className={`${nippo.variable} font-nippo flex flex-col bg-background text-foreground h-full antialiased`}
        >
          <MainNavigation />
          <main className="max-w-8xl mx-auto w-full flex-1 p-3">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
          <footer className="max-w-8xl mx-auto p-3 pt-0 w-full">
            <div className="bg-card text-card-foreground w-full flex justify-end items-center border p-2 rounded-xl shadow-sm">
              <div className="flex items-end">
                <Link href="https://ko-fi.com/X8X11CCUAU" target="_blank">
                  <Button variant="link" size="sm">
                    <KofiLogo />
                    Buy me a Coffee
                  </Button>
                </Link>
                <Link
                  href="https://github.com/aaronsts/monsterbrew-app"
                  target="_blank"
                  referrerPolicy="no-referrer"
                >
                  <Button size="icon" variant="ghost">
                    <GithubLogo />
                  </Button>
                </Link>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
