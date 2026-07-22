"use client";
import { Link } from "@tanstack/react-router";
import { Footprints, Heart, Shield } from "lucide-react";
import { CreatureStat } from "./creature-stat";

import type { Monster } from "@/schema/monster-schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHitPoints, titleCase } from "@/lib/utils";

export function CreatureCard({
  creature,
  srdKey,
}: Readonly<{
  creature: Monster & { id?: string };
  srdKey?: string;
}>) {
  const typeLine = [creature.size, creature.type]
    .filter(Boolean)
    .map((part) => titleCase(part))
    .join(" ");

  const median = calculateHitPoints(
    creature.hit_dice,
    creature.size,
    creature.ability_scores.con,
  );
  const hpRaw = creature.custom_hp
    ? creature.hit_points
    : median || creature.hit_points;
  const hp = Number.parseInt(hpRaw ?? "", 10);
  const speed = creature.movements?.walk ?? 0;

  const linkProps = srdKey
    ? ({ to: "/library/srd/$key", params: { key: srdKey } } as const)
    : ({ to: "/library/$id", params: { id: creature.id ?? "" } } as const);

  return (
    <Link
      {...linkProps}
      className="group/link block focus-visible:outline-none"
    >
      <Card className="h-full cursor-pointer gap-3 py-4 ring-foreground/10 transition-all duration-200 group-hover/link:-translate-y-0.5 group-hover/link:border-l-accent group-hover/link:shadow-md group-hover/link:ring-primary group-focus-visible/link:ring-2 group-focus-visible/link:ring-primary">
        <CardHeader className="px-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-heading text-lg font-bold leading-tight tracking-wide text-accent transition-colors group-hover/link:text-accent/80">
              {creature.name || "Unknown Creature"}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge>CR {creature.cr.challenge_rating}</Badge>
            </div>
          </div>
          <p className="capitalize italic text-muted-foreground">
            {typeLine || "Unknown type"}
            {creature.alignment ? `, ${creature.alignment}` : ""}
          </p>
        </CardHeader>
        <CardContent className="px-4">
          <div className="h-0.5 w-full bg-linear-to-r from-primary to-transparent" />
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <CreatureStat
              icon={Shield}
              label="Armor Class"
              value={String(creature.armor_class ?? 0)}
            />
            <CreatureStat
              icon={Heart}
              label="Hit Points"
              value={Number.isNaN(hp) ? "—" : String(hp)}
            />
            <CreatureStat
              icon={Footprints}
              label="Speed"
              value={`${speed} ft.`}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
