"use client";

import { BookOpenText } from "lucide-react";
import { useCrComparison } from "./use-cr-comparison";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMod } from "@/lib/utils";

export function RecommendedStatsDialog() {
  const comparison = useCrComparison();
  if (!comparison) return null;

  const { benchmark, abilityModifier, damageTarget } = comparison;

  const hasPremium = damageTarget !== benchmark.damagePerRound;
  const rows = [
    { stat: "Armor class / save DC", target: `${benchmark.acDc}` },
    {
      stat: "Hit points",
      target: `${benchmark.hpAverage} (${benchmark.hpMin}–${benchmark.hpMax})`,
    },
    { stat: "Attack bonus", target: formatMod(benchmark.proficientBonus) },
    {
      stat: "Main ability modifier",
      target: formatMod(abilityModifier.benchmark),
    },
    {
      stat: "Damage per round",
      target: `${damageTarget} across ${benchmark.attacks} ${
        benchmark.attacks === 1 ? "attack" : "attacks"
      }${hasPremium ? ", legendary premium included" : ""}`,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
          />
        }
      >
        <BookOpenText className="size-3.5" />
        Recommended stats
      </DialogTrigger>
      <DialogContent className="gap-3">
        <DialogHeader>
          <DialogTitle>Recommended stats for CR {benchmark.cr}</DialogTitle>
          <DialogDescription>
            Attack bonus and save DC are projected from the best ability score
            and the proficiency bonus. Hit points are read from the number at
            the start of the Hit Points field. Damage per round assumes every
            attack hits and every save fails; halve it for effects that catch
            two or more characters at once.
          </DialogDescription>
        </DialogHeader>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Stat</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.stat}>
                <TableCell className="font-medium">{row.stat}</TableCell>
                <TableCell>{row.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {benchmark.exampleMonsters && (
          <p className="text-xs text-muted-foreground">
            Published monsters at this CR are {benchmark.exampleMonsters}.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
