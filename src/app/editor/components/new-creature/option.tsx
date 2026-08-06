import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The shared card surface behind every option, clickable or not. */
export const optionSurface =
  "flex h-full flex-col gap-3 bg-card p-4 text-left ring-1 ring-foreground/10";

export function OptionHeading({
  icon: Icon,
  as: Heading = "h3",
  children,
}: Readonly<{ icon: LucideIcon; as?: "h3" | "span"; children: ReactNode }>) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <Heading className="font-heading text-sm font-medium">{children}</Heading>
    </span>
  );
}

/**
 * An option that does one thing when clicked. The whole card is the button, so
 * the accessible name is its title plus description.
 */
export function StartOption({
  icon,
  title,
  description,
  onClick,
}: Readonly<{
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        optionSurface,
        "transition-shadow hover:ring-2 hover:ring-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <OptionHeading icon={icon} as="span">
        {title}
      </OptionHeading>
      <span className="text-sm text-muted-foreground">{description}</span>
    </button>
  );
}
