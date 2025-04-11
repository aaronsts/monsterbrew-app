import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs italic w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        accent:
          "font-normal pl-2 pr-1 text-xs text-accent-foreground bg-accent border-ring transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        proficient:
          "bg-proficient text-proficient-foreground hover:bg-proficient/80",
        expert: "bg-expert text-expert-foreground hover:bg-expert/80",
        resistant: "bg-resistant text-white hover:bg-resistant/80",
        immune: "bg-immune text-white hover:bg-immune/80",

        aberration: "bg-aberration/20 border-aberration",
        beast: "bg-beast/20 border-beast",
        celestial: "bg-celestial/20 border-celestial",
        construct: "bg-construct/20 border-construct",
        dragon: "bg-dragon/20 border-dragon",
        elemental: "bg-elemental/20 border-elemental",
        fey: "bg-fey/20 border-fey",
        fiend: "bg-fiend/20 border-fiend",
        giant: "bg-giant/20 border-giant",
        humanoid: "bg-humanoid/20 border-humanoid",
        monstrosity: "bg-monstrosity/20 border-monstrosity",
        ooze: "bg-ooze/20 border-ooze",
        plant: "bg-plant/20 border-plant",
        undead: "bg-undead/20 border-undead",
        other: "bg-other/20 border-other",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
