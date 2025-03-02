import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";
import { Info } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export const Alert = React.forwardRef<
  HTMLDivElement,
  AlertProps & VariantProps<typeof alertVariants>
>(({ title, description, variant, className, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    <Info />
    <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>
    {description && (
      <div className="text-sm [&_p]:leading-relaxed">{description}</div>
    )}
  </div>
));
