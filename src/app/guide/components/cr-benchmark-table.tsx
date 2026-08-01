import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CR_BENCHMARKS } from "@/lib/constants/cr-benchmarks";

export function CrBenchmarkTable() {
  return (
    <div className="my-6 border border-border">
      <div className="max-h-[70vh] overflow-y-auto">
        <Table className="text-sm">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>CR</TableHead>
              <TableHead>Eqv. level</TableHead>
              <TableHead>AC / DC</TableHead>
              <TableHead>HP (range)</TableHead>
              <TableHead>Atk. bonus</TableHead>
              <TableHead>Damage / round</TableHead>
              <TableHead>Attacks</TableHead>
              <TableHead>Damage / attack</TableHead>
              <TableHead>Example monsters</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CR_BENCHMARKS.map((row) => (
              <TableRow key={row.cr}>
                <TableCell className="font-medium text-accent">
                  {row.cr}
                </TableCell>
                <TableCell>{row.equivalentLevel}</TableCell>
                <TableCell>{row.acDc}</TableCell>
                <TableCell>
                  {row.hpAverage}{" "}
                  <span className="text-muted-foreground">
                    ({row.hpMin}–{row.hpMax})
                  </span>
                </TableCell>
                <TableCell>+{row.proficientBonus}</TableCell>
                <TableCell>{row.damagePerRound}</TableCell>
                <TableCell>{row.attacks}</TableCell>
                <TableCell>{row.damagePerAttack}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.exampleMonsters}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption className="px-2 pb-3 text-left whitespace-normal">
            Adapted from the Lazy GM&rsquo;s 5e Monster Builder Resource
            Document by Teos Abadía, Scott Fitzgerald Gray, and Michael E. Shea
            (CC-BY 4.0). &ldquo;Prof. bonus&rdquo; is the proficient ability
            bonus: ability modifier and proficiency bonus combined, usable as
            the attack bonus.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
