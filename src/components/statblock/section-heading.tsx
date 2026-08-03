import type { PropsWithChildren } from "react";

export function SectionHeading({ children }: Readonly<PropsWithChildren>) {
  return (
    <h3 className="mb-2 break-after-avoid border-b border-accent-700 pb-0.5 font-heading text-lg leading-tight font-semibold tracking-wide [font-variant-caps:small-caps] text-accent-700 dark:border-accent-500 dark:text-accent-500">
      {children}
    </h3>
  );
}
