"use client";
import Image from "next/image";
import beholder from "../components/images/beholder-pixelart.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Dices,
  FileEdit,
  Layers,
  Save,
  Share2,
  Wand2,
} from "lucide-react";
import { FeatureCard } from "@/components/home/feature-card";
import { UseCaseCard } from "@/components/home/use-case-card";
import { StepCard } from "@/components/home/step-card";

export default function Home() {
  return (
    <div className="w-full flex flex-col py-8 gap-16 px-6">
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <Badge variant="secondary" className="lg:mr-auto">
            Free & Open Source
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Create Epic D&D Creatures <br />
            <span className="text-primary">In Minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Monsterbrew is the ultimate tool for Dungeon Masters to create,
            customize, and manage creatures for Dungeons & Dragons 5th Edition
            campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link href="/editor">
              <Button variant="filled" color="carrara">
                Start Creating <ArrowRight />
              </Button>
            </Link>
            <Link href="/my-creatures">
              <Button variant="light" color="carrara">
                View My Creatures
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center mb-6 rounded-full p-4 animate-move">
          <Image
            src={beholder}
            alt="Dungeons and Dragons Beholder looking down"
            width={350}
            height={350}
            priority
            className="drop-shadow-xl"
          />
        </div>
      </section>

      <section>
        <div className="text-center mb-8">
          <h2 className="mb-4">Powerful Features for DMs</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create balanced and exciting encounters for
            your players
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Wand2 className="h-10 w-10 text-primary" />}
            title="Intuitive Creator"
            description="Build creatures with an easy-to-use interface. No calculations to remember - just create!"
          />
          <FeatureCard
            icon={<Dices className="h-10 w-10 text-primary" />}
            title="CR Calculator"
            description="Calculate Challenge Rating based on stats, ensuring balanced encounters."
            badge="coming soon"
          />
          <FeatureCard
            icon={<FileEdit className="h-10 w-10 text-primary" />}
            title="Custom Statblocks"
            description="Generate statblocks that match the new D&D formatting."
          />
          <FeatureCard
            icon={<Save className="h-10 w-10 text-primary" />}
            title="Local Storage"
            description="All your creatures are saved locally - no account required."
          />
          <FeatureCard
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Creature Library"
            description="Organize and manage your collection of custom creatures for easy access."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-primary" />}
            title="Export Options"
            description="Export your creatures as JSON or markdown to use in other tools."
          />
        </div>
      </section>

      <section className="py-16 bg-carrara-950 text-carrara-50 rounded-xl p-8">
        <h2 className="text-center">How Monsterbrew Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Design Your Creature"
            description="Enter basic stats, abilities, and special features using our intuitive form."
          />
          <StepCard
            number="2"
            title="Preview & Refine"
            description="See it come to life with a real-time preview of the statblock."
          />
          <StepCard
            number="3"
            title="Save & Export"
            description="Store your creature in your library and export it for your game sessions."
          />
        </div>
      </section>

      <section>
        <div className="text-center mb-12">
          <h2>Perfect for Every Campaign</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From one-shot adventures to epic campaigns, Monsterbrew helps DMs
            create memorable creatures
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UseCaseCard
            title="Homebrew Campaigns"
            description="Create unique creatures that fit perfectly into your custom world and lore."
            icon={<Brain className="h-8 w-8 text-primary" />}
          />
          <UseCaseCard
            title="Adventure Modules"
            description="Modify existing creatures or create variants to surprise players who know the module."
            icon={<BookOpen className="h-8 w-8 text-primary" />}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-carrara-300 text-carrara-950 rounded-xl p-8 text-center">
        <h2>Ready to Create Your First Creature?</h2>
        <Link href="/editor">
          <Button size="lg" variant="filled" color="stromboli">
            Start Creating <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
