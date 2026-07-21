import { Link } from "@tanstack/react-router";
import { KofiLogo } from "@/components/images/KofiLogo";
import { GithubLogo } from "@/components/images/GithubLogo";

const navigation = [
  { href: "/editor", label: "Editor" },
  { href: "/library", label: "Library" },
  { href: "/changelog", label: "Changelog" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 w-full border-t border-border/60">
      <div className="max-w-8xl mx-auto flex w-full flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="flex max-w-xs flex-col gap-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Monsterbrew
          </Link>
          <p className="text-sm text-muted-foreground text-balance">
            A free statblock builder for D&D 5e. Build, save, and export your
            homebrew creatures.
          </p>
          <a
            href="https://github.com/aaronsts/monsterbrew-app"
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubLogo />
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Navigation
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
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
              <a
                href="https://ko-fi.com/X8X11CCUAU"
                target="_blank"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <KofiLogo />
                Buy me a Coffee
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="max-w-8xl mx-auto flex w-full flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Monsterbrew</p>
          <p>
            Not affiliated with Wizards of the Coast. Made for Dungeon Masters.
          </p>
        </div>
      </div>
    </footer>
  );
}
