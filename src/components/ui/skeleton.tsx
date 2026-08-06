import { cn } from "@/lib/utils";

/**
 * Diverges from the upstream shadcn default on one point: `bg-foreground/10`
 * instead of `bg-muted`. In this theme `--muted` resolves to exactly the same
 * colour as `--background`, so a muted skeleton sitting on the page background
 * is invisible. That token still reads fine everywhere else it's used (hover
 * states inside popovers and dropdowns, which sit on `--popover`), so the fix
 * belongs here rather than in the theme.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-foreground/10", className)}
      {...props}
    />
  );
}
