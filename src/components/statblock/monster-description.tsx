import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

/** Flavor text shown alongside the statblock rather than inside it. */
export function MonsterDescription({
  description,
  className,
}: {
  description?: string;
  className?: string;
}) {
  const text = description?.trim();
  if (!text) return null;
  return (
    <div className={cn("text-sm", className)}>
      <SectionHeading>Description</SectionHeading>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  );
}
