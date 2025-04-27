import type { Metadata } from "next";
import "./globals.css";

import "@fontsource/yatra-one";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { KofiLogo } from "@/components/images/KofiLogo";
import { Button } from "@/components/ui/button";
import { GithubLogo } from "@/components/images/GithubLogo";
import Script from "next/script";
import { PropsWithChildren } from "react";
import { Providers } from "@/components/providers/providers";

import { nippo } from "./fonts/nippo/nippoVariable";
import { SiteHeader } from "@/components/ui/side-header";

export const metadata: Metadata = {
  title: "Monsterbrew | D&D 5e Monster Creator & Homebrew Tool",
  description:
    "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters. Design unique encounters for your tabletop RPG campaigns!",
  keywords: [
    "D&D monster creator",
    "DnD 5e homebrew",
    "D&D creature builder",
    "Dungeons and Dragons monsters",
    "tabletop RPG tools",
    "DM resources",
    "custom D&D creatures",
    "monster statblock generator",
    "5e encounter design",
    "fantasy creature creator",
  ],
  creator: "Monsterbrew",
  openGraph: {
    title: "Monsterbrew | D&D 5e Monster Creator & Homebrew Tool",
    description:
      "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters.",
    url: "https://monsterbrew.app",
    siteName: "Monsterbrew",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monsterbrew | D&D 5e Monster Creator & Homebrew Tool",
    description:
      "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew.",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Monsterbrew",
    url: "https://monsterbrew.app",
    description:
      "Create, customize and manage D&D 5e monsters and creatures with Monsterbrew - the free, intuitive homebrew tool for Dungeon Masters.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    keywords:
      "D&D, DnD, Dungeons and Dragons, monster creator, homebrew, 5e, tabletop RPG",
  };

  return (
    <Providers>
      <html lang="en" className="h-full">
        <head>
          <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        </head>
        <body
          className={`${nippo.variable} font-nippo flex flex-col bg-background text-foreground h-full antialiased`}
        >
          <SiteHeader />
          <main className="max-w-8xl mx-auto w-full flex-1 p-3">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
          <footer className="max-w-8xl mx-auto px-3 pt-0 w-full">
            <div className="bg-card text-card-foreground w-full flex justify-end items-center border p-2 rounded-xl shadow-sm">
              <Link href="/privacy">
                <Button variant="link" size="sm">
                  Privacy Policy
                </Button>
              </Link>
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
    </Providers>
  );
}
