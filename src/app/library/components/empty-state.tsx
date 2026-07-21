"use client";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Skull } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Skull className="size-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-heading text-xl font-bold tracking-wide">
          No creatures yet
        </h3>
        <p className="max-w-sm text-muted-foreground">
          Your saved monsters live here. Brew your first one and it will show up
          on this shelf.
        </p>
      </div>
      <Link to="/editor">
        <Button size="lg">
          Create your first monster
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
