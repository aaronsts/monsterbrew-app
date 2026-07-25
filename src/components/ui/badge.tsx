import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        accent: "bg-accent text-accent-foreground [a]:hover:bg-accent/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/70 dark:text-destructive-foreground dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        /* creature type variants */
        aberration: "border-aberration bg-aberration/20 text-foreground",
        beast: "border-beast bg-beast/20 text-foreground",
        celestial: "border-celestial bg-celestial/20 text-foreground",
        construct: "border-construct bg-construct/20 text-foreground",
        dragon: "border-dragon bg-dragon/20 text-foreground",
        elemental: "border-elemental bg-elemental/20 text-foreground",
        fey: "border-fey bg-fey/20 text-foreground",
        fiend: "border-fiend bg-fiend/20 text-foreground",
        giant: "border-giant bg-giant/20 text-foreground",
        humanoid: "border-humanoid bg-humanoid/20 text-foreground",
        monstrosity: "border-monstrosity bg-monstrosity/20 text-foreground",
        ooze: "border-ooze bg-ooze/20 text-foreground",
        plant: "border-plant bg-plant/20 text-foreground",
        undead: "border-undead bg-undead/20 text-foreground",
        other: "border-other bg-other/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
