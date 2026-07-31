"use client";

import {
  setCrSuggestionsEnabled,
  useCrSuggestionsEnabled,
} from "./use-cr-suggestions-enabled";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function CrSuggestionsToggle() {
  const enabled = useCrSuggestionsEnabled();
  return (
    <Field
      orientation="horizontal"
      className="w-auto shrink-0 items-center self-stretch bg-background/95 px-1.5 lg:self-auto lg:bg-transparent lg:px-0"
    >
      <Switch
        id="cr-suggestions-toggle"
        size="sm"
        checked={enabled}
        onCheckedChange={setCrSuggestionsEnabled}
      />
      <FieldLabel
        htmlFor="cr-suggestions-toggle"
        className="text-xs font-normal text-muted-foreground"
      >
        <span aria-hidden className="hidden sm:inline">
          CR Suggestions
        </span>
        <span className="sr-only">CR suggestions</span>
      </FieldLabel>
    </Field>
  );
}
