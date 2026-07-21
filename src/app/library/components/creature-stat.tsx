import type { LucideIcon } from "lucide-react";

export function CreatureStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className="size-3.5 text-primary" />
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}
