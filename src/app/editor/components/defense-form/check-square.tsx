import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckSquare({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 items-center justify-center rounded-none border border-input transition-colors",
        checked && "border-primary bg-primary text-primary-foreground",
      )}
    >
      {checked && <Check className="size-3.5" />}
    </span>
  );
}
