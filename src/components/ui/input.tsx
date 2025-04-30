import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-carrara-100 file:text-carrara-950 placeholder:text-carrara-400 selection:bg-carrara-900 selection:text-carrara-200 flex h-9 w-full min-w-0 rounded-md border bg-carrara-50 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:cursor-pointer  file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-stromboli-400 focus-visible:ring-stromboli-400/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
