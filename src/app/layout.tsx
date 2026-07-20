import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { KofiLogo } from "@/components/images/KofiLogo";
import { GithubLogo } from "@/components/images/GithubLogo";
import Script from "next/script";
import { PropsWithChildren } from "react";
import { Providers } from "@/components/providers/providers";

import { nippo } from "./fonts/nippo/nippoVariable";
import { SiteHeader } from "@/components/ui/site-header";
import { JetBrains_Mono, Oxanium } from "next/font/google";
import { cn } from "@/lib/utils";

const oxaniumHeading = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

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
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "h-dvh",
          "font-mono",
          jetbrainsMono.variable,
          oxaniumHeading.variable,
        )}
      >
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
          className={`${nippo.variable} font-nippo flex flex-col bg-background text-foreground h-dvh antialiased`}
        >
          <SiteHeader />
          <main className="max-w-8xl mx-auto w-full mt-14 flex-1 p-3">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
          <footer className="mt-16 w-full border-t border-border/60">
            <div className="max-w-8xl mx-auto flex w-full flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between">
              {/* Brand */}
              <div className="flex max-w-xs flex-col gap-3">
                <Link href="/" className="text-lg font-bold tracking-tight">
                  Monsterbrew
                </Link>
                <p className="text-sm text-muted-foreground text-balance">
                  A free statblock builder for D&D 5e. Build, save, and export
                  your homebrew creatures.
                </p>
                <Link
                  href="https://github.com/aaronsts/monsterbrew-app"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <GithubLogo />
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-3">
                <p className="text-xs font-medium tracking-widest text-primary uppercase">
                  Navigation
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  {[
                    { href: "/editor", label: "Editor" },
                    { href: "/my-creatures", label: "Library" },
                    { href: "/changelog", label: "Changelog" },
                    { href: "/privacy", label: "Privacy Policy" },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Support */}
              <nav className="flex flex-col gap-3">
                <p className="text-xs font-medium tracking-widest text-primary uppercase">
                  Support
                </p>
                <ul className="flex flex-col gap-2 text-sm">
                  <li>
                    <Link
                      href="https://ko-fi.com/X8X11CCUAU"
                      target="_blank"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <KofiLogo />
                      Buy me a Coffee
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border/60">
              <div className="max-w-8xl mx-auto flex w-full flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row">
                <p>© {new Date().getFullYear()} Monsterbrew</p>
                <p>
                  Not affiliated with Wizards of the Coast. Made for Dungeon
                  Masters.
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </Providers>
  );
}
