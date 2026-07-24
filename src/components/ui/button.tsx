import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      color: {
        neutral: "",
        primary: "",
        accent: "",
        destructive: "",
      },
      variant: {
        filled: "",
        light: "",
        outline: "",
        ghost: "",
        transparent: "",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-none",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      /* neutral */
      {
        color: "neutral",
        variant: "filled",
        class:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
      },
      {
        color: "neutral",
        variant: "light",
        class:
          "bg-foreground/10 text-foreground hover:bg-foreground/15 aria-expanded:bg-foreground/15",
      },
      {
        color: "neutral",
        variant: "outline",
        class:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
      },
      {
        color: "neutral",
        variant: "ghost",
        class:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
      },
      {
        color: "neutral",
        variant: "transparent",
        class: "hover:text-foreground aria-expanded:text-foreground",
      },
      /* primary */
      {
        color: "primary",
        variant: "filled",
        class: "bg-primary text-primary-foreground hover:bg-primary-hover",
      },
      {
        color: "primary",
        variant: "light",
        class:
          "bg-primary/15 text-(--primary-700) hover:bg-primary/25 aria-expanded:bg-primary/25 dark:text-(--primary-300)",
      },
      {
        color: "primary",
        variant: "outline",
        class:
          "border-primary text-(--primary-700) hover:bg-primary/10 aria-expanded:bg-primary/10 dark:text-(--primary-300)",
      },
      {
        color: "primary",
        variant: "ghost",
        class:
          "text-(--primary-700) hover:bg-primary/10 aria-expanded:bg-primary/10 dark:text-(--primary-300)",
      },
      {
        color: "primary",
        variant: "transparent",
        class:
          "text-(--primary-700) hover:text-(--primary-900) aria-expanded:text-(--primary-900) dark:text-(--primary-300) dark:hover:text-(--primary-100) dark:aria-expanded:text-(--primary-100)",
      },
      /* accent */
      {
        color: "accent",
        variant: "filled",
        class: "bg-accent text-accent-foreground hover:bg-accent-hover",
      },
      {
        color: "accent",
        variant: "light",
        class:
          "bg-accent/15 text-(--accent-700) hover:bg-accent/25 aria-expanded:bg-accent/25 dark:text-(--accent-300)",
      },
      {
        color: "accent",
        variant: "outline",
        class:
          "border-accent text-(--accent-700) hover:bg-accent/10 aria-expanded:bg-accent/10 dark:text-(--accent-300)",
      },
      {
        color: "accent",
        variant: "ghost",
        class:
          "text-(--accent-700) hover:bg-accent/10 aria-expanded:bg-accent/10 dark:text-(--accent-300)",
      },
      {
        color: "accent",
        variant: "transparent",
        class:
          "text-(--accent-700) hover:text-(--accent-900) aria-expanded:text-(--accent-900) dark:text-(--accent-300) dark:hover:text-(--accent-100) dark:aria-expanded:text-(--accent-100)",
      },
      /* destructive */
      {
        color: "destructive",
        variant: "filled",
        class:
          "bg-destructive text-destructive-foreground hover:bg-(--destructive-700) dark:hover:bg-(--destructive-900)",
      },
      {
        color: "destructive",
        variant: "light",
        class:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/80 dark:text-destructive-foreground dark:hover:bg-destructive/60 dark:focus-visible:ring-destructive/40",
      },
      {
        color: "destructive",
        variant: "outline",
        class:
          "border-destructive text-(--destructive-700) hover:bg-destructive/10 aria-expanded:bg-destructive/10 dark:text-(--destructive-300)",
      },
      {
        color: "destructive",
        variant: "ghost",
        class:
          "text-(--destructive-700) hover:bg-destructive/10 aria-expanded:bg-destructive/10 dark:text-(--destructive-300)",
      },
      {
        color: "destructive",
        variant: "transparent",
        class:
          "text-(--destructive-700) hover:text-(--destructive-900) aria-expanded:text-(--destructive-900) dark:text-(--destructive-300) dark:hover:text-(--destructive-100) dark:aria-expanded:text-(--destructive-100)",
      },
    ],
    defaultVariants: {
      color: "primary",
      variant: "filled",
      size: "default",
    },
  },
);

type ButtonProps = Omit<ButtonPrimitive.Props, "color"> &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  color = "primary",
  variant = "filled",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ color, variant, size, className }))}
      {...props}
    />
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
export type { ButtonProps };
