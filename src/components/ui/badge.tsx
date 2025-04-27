import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex px-5 py-0.5 items-center justify-center rounded-sm border text-xs w-fit italic  whitespace-nowrap gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-carrara-600 text-carrara-100 [a&]:hover:bg-carrara-300",
        secondary: "border-stromboli-400 bg-stromboli-200 text-stromboli-700 ",
        destructive: "border-transparent bg-destructive text-white",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        proficient: "bg-stromboli-400 text-stromboli-50",
        expert: "bg-calypso-400 text-calypso-50 ",
        resistant: "border-transparent bg-resistant text-white",
        immune: "border-transparent bg-immune text-whit",

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
