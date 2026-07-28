import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding font-mono font-normal whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive-500 aria-invalid:ring-1 aria-invalid:ring-destructive-500/20 dark:aria-invalid:border-destructive-300 dark:aria-invalid:ring-destructive-300/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      color: {
        neutral: "",
        primary: "",
        accent: "",
        destructive: "",
      },
      variant: {
        filled:
          "disabled:border-transparent disabled:bg-neutral-500 disabled:text-neutral-100 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500",
        light:
          "disabled:border-transparent disabled:bg-neutral-500 disabled:text-neutral-100 dark:disabled:bg-neutral-700 dark:disabled:text-neutral-500",
        outline:
          "disabled:bg-transparent disabled:text-muted-foreground disabled:border-border",
        ghost:
          "disabled:bg-transparent disabled:text-muted-foreground disabled:border-border",
        transparent:
          "disabled:bg-transparent disabled:text-muted-foreground disabled:border-border",
        link: "text-accent underline underline-offset-[3px] hover:text-accent-hover disabled:bg-transparent disabled:text-muted-foreground disabled:border-border",
      },
      size: {
        default:
          "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      /* link ignores the size box — sits inline as text. Compound entries are
         appended after the size variant, so these win the last-wins merge. */
      {
        variant: "link",
        class:
          "h-auto gap-1 px-0 has-data-[icon=inline-start]:pl-0 has-data-[icon=inline-end]:pr-0",
      },
      /* neutral — the sand family; filled is a tan chip with ink text */
      {
        color: "neutral",
        variant: "filled",
        class:
          "bg-secondary text-secondary-foreground hover:bg-neutral-500 hover:text-neutral-100 aria-expanded:bg-neutral-500 aria-expanded:text-neutral-100 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-500",
      },
      {
        color: "neutral",
        variant: "light",
        class:
          "bg-foreground/8 text-neutral-700 hover:bg-secondary hover:text-neutral-900 aria-expanded:bg-secondary dark:bg-foreground/10 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100",
      },
      {
        color: "neutral",
        variant: "outline",
        class:
          "border-neutral-500 text-neutral-700 hover:bg-foreground/8 hover:text-neutral-900 aria-expanded:bg-foreground/8 dark:text-neutral-300 dark:hover:bg-foreground/10 dark:hover:text-neutral-100",
      },
      {
        color: "neutral",
        variant: "ghost",
        class:
          "text-neutral-700 hover:bg-foreground/8 hover:text-neutral-900 aria-expanded:bg-foreground/8 dark:text-neutral-300 dark:hover:bg-foreground/10 dark:hover:text-neutral-100",
      },
      {
        color: "neutral",
        variant: "transparent",
        class:
          "text-neutral-700 hover:text-neutral-900 aria-expanded:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100",
      },
      /* primary — ink; the semantic tokens already flip per theme */
      {
        color: "primary",
        variant: "filled",
        class:
          "bg-primary text-primary-foreground hover:bg-primary-hover aria-expanded:bg-primary-hover",
      },
      {
        color: "primary",
        variant: "light",
        class:
          "bg-primary/12 text-primary-700 hover:bg-primary hover:text-primary-foreground aria-expanded:bg-primary/20 dark:bg-primary/15 dark:text-primary-100 dark:hover:bg-primary dark:hover:text-primary-foreground",
      },
      {
        color: "primary",
        variant: "outline",
        class:
          "border-primary text-primary-700 hover:bg-primary/10 aria-expanded:bg-primary/10 dark:border-primary-300 dark:text-primary-100 dark:hover:bg-primary/15",
      },
      {
        color: "primary",
        variant: "ghost",
        class:
          "text-primary-700 hover:bg-primary/10 aria-expanded:bg-primary/10 dark:text-primary-100 dark:hover:bg-primary/15",
      },
      {
        color: "primary",
        variant: "transparent",
        class:
          "text-primary-700 hover:text-primary-900 aria-expanded:text-primary-900 dark:text-primary-300 dark:hover:text-primary-100",
      },
      /* accent — brick red, the app's CTA */
      {
        color: "accent",
        variant: "filled",
        class:
          "bg-accent text-accent-foreground hover:bg-accent-hover aria-expanded:bg-accent-hover",
      },
      {
        color: "accent",
        variant: "light",
        class:
          "bg-accent/12 text-accent-700 hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent/20 dark:bg-accent/18 dark:text-accent-300 dark:hover:bg-accent dark:hover:text-accent-foreground",
      },
      {
        color: "accent",
        variant: "outline",
        class:
          "border-accent text-accent-700 hover:bg-accent/10 aria-expanded:bg-accent/10 dark:border-accent-300 dark:text-accent-300 dark:hover:bg-accent/18",
      },
      {
        color: "accent",
        variant: "ghost",
        class:
          "text-accent-700 hover:bg-accent/10 aria-expanded:bg-accent/10 dark:text-accent-300 dark:hover:bg-accent/18",
      },
      {
        color: "accent",
        variant: "transparent",
        class:
          "text-accent-700 hover:text-accent-900 aria-expanded:text-accent-900 dark:text-accent-300 dark:hover:text-accent-100",
      },
      /* destructive — reads off the 500 scale step, since the semantic
         --destructive token is a light surface in this system */
      {
        color: "destructive",
        variant: "filled",
        class:
          "bg-destructive-500 text-neutral-100 hover:bg-destructive-700 aria-expanded:bg-destructive-700 dark:hover:bg-destructive-300 dark:hover:text-destructive-900",
      },
      {
        color: "destructive",
        variant: "light",
        class:
          "bg-destructive-500/12 text-destructive-700 hover:bg-destructive-500 hover:text-neutral-100 aria-expanded:bg-destructive-500/20 dark:bg-destructive-500/25 dark:text-destructive-300 dark:hover:bg-destructive-500 dark:hover:text-neutral-100",
      },
      {
        color: "destructive",
        variant: "outline",
        class:
          "border-destructive-500 text-destructive-700 hover:bg-destructive-500/10 aria-expanded:bg-destructive-500/10 dark:border-destructive-300 dark:text-destructive-300 dark:hover:bg-destructive-500/25",
      },
      {
        color: "destructive",
        variant: "ghost",
        class:
          "text-destructive-700 hover:bg-destructive-500/10 aria-expanded:bg-destructive-500/10 dark:text-destructive-300 dark:hover:bg-destructive-500/25",
      },
      {
        color: "destructive",
        variant: "transparent",
        class:
          "text-destructive-700 hover:text-destructive-900 aria-expanded:text-destructive-900 dark:text-destructive-300 dark:hover:text-destructive-100",
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

export { Button, buttonVariants };
export type { ButtonProps };
