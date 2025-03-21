import { cn } from "@/lib/utils";

interface DescriptionProps extends Partial<HTMLParagraphElement> {
  title: string;
  description: string | number;
  show?: boolean;
  placeholder?: string;
}

export function Description({
  title,
  description,
  show = true,
  className,
  placeholder = "",
}: DescriptionProps) {
  if (!show) return null;
  return (
    <p className={cn(className)}>
      <span className="italic font-semibold">{title}.</span>{" "}
      {description || placeholder}
    </p>
  );
}
