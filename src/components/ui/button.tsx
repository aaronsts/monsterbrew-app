import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none min-w-fit shrink-0 [&_svg]:shrink-0 cursor-pointer focus-visible:border-stromboli-400 focus-visible:ring-ring/50 focus-visible:ring-[3px]aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        filled: "",
        outline: "border bg-transparent",
        light: "",
        transparant: "",

        link: "text-primary underline-offset-4 hover:underline",
        proficient:
          "bg-proficient text-proficient-foreground shadow-xs hover:bg-proficient/80",
        expert: "bg-expert text-expert-foreground shadow-xs hover:bg-expert/80",
        form: "border-input bg-carrara-50 data-[placeholder]:text-carrara-400 [&_svg:not([class*='text-'])]:text-carrara-700 focus-visible:border-stromboli-400 focus-visible:ring-stromboli-400/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 min-w-32 w-fit items-center justify-between gap-2 rounded-md border  px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      },
      color: {
        default: "bg-transparent",
        carrara: "bg-carrara-950 text-carrara-100 hover:bg-carrara-950/90",
        calypso: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        stromboli: "bg-accent text-accent-foreground hover:bg-accent/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        proficient:
          "bg-proficient text-proficient-foreground hover:bg-proficient/90",
        expert: "bg-expert text-expert-foreground hover:bg-expert/90",
        resistant: "bg-resistant text-white hover:bg-resistant/90",
        immune: "bg-immune text-white hover:bg-immune/90",
      },
      size: {
        default: "h-9 text-sm px-4 py-2 has-[>svg]:px-3 [&_svg]:size-5",
        sm: "h-8 text-xs rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 [&_svg]:size-4",
        lg: "h-10 text-base rounded-md px-6 has-[>svg]:px-4 [&_svg]:size-6",
        icon: "size-9 [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    compoundVariants: [
      {
        color: "carrara",
        variant: "filled",
        className: "bg-carrara-950 text-carrara-100 hover:bg-carrara-900",
      },
      {
        color: "calypso",
        variant: "filled",
        className: "bg-calypso-500 text-calypso-100 hover:bg-calypso-500/90",
      },
      {
        color: "stromboli",
        variant: "filled",
        className:
          "bg-stromboli-500 text-stromboli-50 hover:bg-stromboli-500/90",
      },
      {
        color: "destructive",
        variant: "filled",
        className:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },

      {
        color: "carrara",
        variant: "outline",
        className:
          "bg-transparent border-carrara-950 text-carrara-950 hover:bg-carrara-950/10",
      },
      {
        color: "calypso",
        variant: "outline",
        className:
          "bg-transparent border-calypso-500 text-calypso-500 hover:bg-calypso-500/10",
      },
      {
        color: "stromboli",
        variant: "outline",
        className:
          "bg-transparent border-stromboli-500 text-stromboli-500 hover:bg-stromboli-500/10",
      },

      {
        color: "carrara",
        variant: "light",
        className: "bg-carrara-200 text-carrara-950 hover:bg-carrara-300",
      },
      {
        color: "calypso",
        variant: "light",
        className:
          "bg-calypso-200 text-calypso-500 hover:text-calypso-600 hover:bg-calypso-300",
      },
      {
        color: "stromboli",
        variant: "light",
        className:
          "bg-stromboli-200 text-stromboli-500 hover:text-stromboli-600 hover:bg-stromboli-300",
      },
      {
        color: "destructive",
        variant: "light",
        className: "bg-destructive/20 text-destructive hover:bg-destructive/30",
      },

      {
        color: "carrara",
        variant: "transparant",
        className: "bg-transparent text-carrara-950 hover:bg-carrara-200",
      },
      {
        color: "calypso",
        variant: "transparant",
        className: "bg-transparent text-calypso-500 hover:bg-calypso-200",
      },
      {
        color: "stromboli",
        variant: "transparant",
        className: "bg-transparent text-stromboli-500 hover:bg-stromboli-200",
      },
      {
        color: "destructive",
        variant: "transparant",
        className: "bg-transparent text-destructive hover:bg-destructive/30",
      },
    ],
    defaultVariants: {
      variant: "filled",
      color: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  color,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
