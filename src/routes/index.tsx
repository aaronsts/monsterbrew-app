import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText, HardDriveDownload, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/home/feature-card";
import { CornerBrackets } from "@/components/home/corner-brackets";

export const Route = createFileRoute("/")({
  component: Home,
});

// eslint-disable-next-line react-refresh/only-export-components
function Home() {
  return (
    <div className="w-full flex flex-col gap-24 py-8 px-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-6 px-4 py-20 text-center sm:px-8 sm:py-28">
        {/* Masked grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25 mask-[radial-gradient(ellipse_60%_70%_at_50%_45%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        {/* Soft glow behind the headline */}

        <CornerBrackets size="size-8" />

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Build D&D monsters,
          <br />
          <span className="text-accent">In Minutes</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-balance">
          Monsterbrew is a statblock builder for D&D 5e. Start from scratch or
          drop a statblock ready to customize into the editor.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link to="/editor">
            <Button size="lg" color="accent" variant="filled">
              Start Brewing <ArrowRight />
            </Button>
          </Link>
          <Link to="/library">
            <Button size="lg" color="neutral" variant="outline">
              View Library
            </Button>
          </Link>
        </div>
      </section>

      {/* What is Monsterbrew */}
      <section
        className="relative overflow-hidden bg-primary ring-1 ring-foreground/10"
        style={{ color: "color-mix(in srgb, var(--bg-base) 96%, white 4%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mask-[radial-gradient(ellipse_75%_75%_at_50%_50%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="mx-auto max-w-5xl px-6 py-14 sm:px-12">
          <p className="mb-8 flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            <span aria-hidden className="size-1.5 bg-muted-foreground" />
            What is Monsterbrew
          </p>
          <div className="grid gap-8 border-b border-white/15 pb-10 md:grid-cols-[1fr_1.15fr] md:gap-x-0">
            <h2 className="mb-0 self-start md:pr-12">
              A tool to make homebrewing feel like a breeze
            </h2>
            <div className="md:border-l md:border-white/15 md:pl-12">
              <p className="text-lg opacity-80">
                Enter a creature&apos;s abilities and we&apos;ll handles the
                rest, modifiers, saving throws, passive scores, and HP all
                update as you type. Import from tools you already use, and
                export to well-known formats like Homebrewery or PDF when
                you&apos;re done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-10 sm:px-8">
        <CornerBrackets />
        <div className="mb-10 text-center">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
            <span aria-hidden className="size-1.5 bg-primary" />
            Features
          </p>
          <h2 className="mb-0">Everything you need to run the encounter</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<FileText />}
            title="Statblock Creator"
            description="A live editor that builds 5e-formatted statblocks as you type. Abilities, saves, and passive scores calculate themselves."
          />
          <FeatureCard
            icon={<Library />}
            title="Creature Library"
            description="Save every creature to your personal library, then search, edit, duplicate, and export them whenever you need them."
          />
          <FeatureCard
            icon={<HardDriveDownload />}
            title="Locally Saved"
            description="Everything lives in your browser — no account and no sign-up required."
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-accent p-10 text-center text-primary-foreground ring-1 ring-foreground/10 sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-15 mask-[radial-gradient(ellipse_70%_70%_at_50%_50%,#000,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--primary-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--primary-foreground) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="relative">
          <h2 className="mb-3">Ready to brew your first monster?</h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Jump into the editor and start brewing!
          </p>
          <Link to="/editor">
            <Button size="lg" color="neutral">
              Start Brewing <ArrowRight />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
