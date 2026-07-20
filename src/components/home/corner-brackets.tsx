import { cn } from "@/lib/utils";

/**
 * Four L-shaped corner brackets that frame a `relative` container.
 * Pass a `color` border class (e.g. "border-primary/70") to recolor.
 */
export function CornerBrackets({
  color = "border-primary/70",
  size = "size-6",
}: {
  color?: string;
  size?: string;
}) {
  const base = "pointer-events-none absolute";
  return (
    <>
      <span
        aria-hidden
        className={cn(base, size, "top-0 left-0 border-t-2 border-l-2", color)}
      />
      <span
        aria-hidden
        className={cn(base, size, "top-0 right-0 border-t-2 border-r-2", color)}
      />
      <span
        aria-hidden
        className={cn(
          base,
          size,
          "bottom-0 left-0 border-b-2 border-l-2",
          color,
        )}
      />
      <span
        aria-hidden
        className={cn(
          base,
          size,
          "right-0 bottom-0 border-r-2 border-b-2",
          color,
        )}
      />
    </>
  );
}
