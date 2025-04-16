import Image from "next/image";
import beholder from "../components/images/beholder-pixelart.svg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function Home() {
  return (
    <div className="w-full flex flex-col py-8 gap-16 px-6">
      <section className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 flex flex-col gap-4 text-center lg:text-left">
          <Badge variant="default" className="-mb-2">
            Free & Open Source
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Create Epic D&D Monsters <br />
            <span className="text-primary">In Minutes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Monsterbrew is the ultimate tool for Dungeon Masters to create,
            customize, and manage creatures for Dungeons & Dragons 5th Edition
            campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link href="/editor" className="flex items-center gap-2">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/my-creatures">
              <Button
                size="lg"
                className="bg-primary/20 text-primary hover:bg-primary/30"
              >
                View My Creatures
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center mb-6 bg-background rounded-full p-4 animate-move">
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
            description="Build monsters with our easy-to-use interface. No complex rules to remember - just create!"
          />
          <FeatureCard
            icon={<Dices className="h-10 w-10 text-primary" />}
            title="CR Calculator"
            description="Automatically calculate Challenge Rating based on stats, ensuring balanced encounters."
          />
          <FeatureCard
            icon={<FileEdit className="h-10 w-10 text-primary" />}
            title="Custom Statblocks"
            description="Generate professional-looking statblocks that match official D&D formatting."
          />
          <FeatureCard
            icon={<Save className="h-10 w-10 text-primary" />}
            title="Local Storage"
            description="All your creations are saved locally - no account required and your data stays private."
          />
          <FeatureCard
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Monster Library"
            description="Organize and manage your collection of custom creatures for easy access."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-primary" />}
            title="Export Options"
            description="Export your monsters as JSON or formatted text to use in other tools."
          />
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground rounded-xl p-8">
        <h2 className="text-center">How Monsterbrew Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Design Your Monster"
            description="Enter basic stats, abilities, and special features using our intuitive form."
          />
          <StepCard
            number="2"
            title="Preview & Refine"
            description="See your creation come to life with a real-time preview of the statblock."
          />
          <StepCard
            number="3"
            title="Save & Export"
            description="Store your monster in your library and export it for your game sessions."
          />
        </div>
      </section>

      <section>
        <div className="text-center mb-12">
          <h2>Perfect for Every Campaign</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From one-shot adventures to epic campaigns, Monsterbrew helps DMs
            create memorable encounters
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UseCaseCard
            title="Homebrew Campaigns"
            description="Create unique monsters that fit perfectly into your custom world and lore."
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
      <section className="py-16 bg-primary text-primary-foreground rounded-xl p-8 text-center">
        <h2>Ready to Create Your First Creature?</h2>
        <Link href="/editor">
          <Button size="lg" variant="accent">
            Start Creating <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="[&_svg]:size-8">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start text-center">
      <div className="size-16 border rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold mb-6">
        {number}
      </div>
      <div className="flex-1 text-left mt-3">
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-lg">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
