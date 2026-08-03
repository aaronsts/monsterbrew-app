import type { Feature } from "../monster-statblock";
import type { MarkupContext } from "@/lib/statblock-markup";
import { resolveMarkup } from "@/lib/statblock-markup";
import { StandAloneDescription as Description } from "@/components/ui/stand-alone-description";

export function TraitList({
  features,
  ctx,
}: {
  features: Array<Feature>;
  ctx: MarkupContext;
}) {
  return (
    <div className="space-y-3">
      {features.map((feature, i) => (
        <div key={feature.name + i} className="break-inside-avoid">
          <Description
            title={feature.name}
            description={resolveMarkup(feature.description, ctx)}
          />
        </div>
      ))}
    </div>
  );
}
