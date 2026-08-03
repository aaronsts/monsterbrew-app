import { SectionHeading } from "./section-heading";
import { TraitList } from "./trait-list";
import type { Feature } from "../monster-statblock";
import type { MarkupContext } from "@/lib/statblock-markup";
import { resolveMarkup } from "@/lib/statblock-markup";

export function FeatureSection({
  title,
  features,
  description,
  ctx,
}: {
  title: string;
  features: Array<Feature>;
  description?: string;
  ctx: MarkupContext;
}) {
  if (features.length === 0) return null;
  return (
    <div className="mt-2">
      <SectionHeading>{title}</SectionHeading>
      {description && (
        <p className="italic mb-1 whitespace-pre-wrap">
          {resolveMarkup(description, ctx)}
        </p>
      )}
      <TraitList features={features} ctx={ctx} />
    </div>
  );
}
