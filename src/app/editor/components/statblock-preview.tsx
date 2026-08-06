"use client";

import { memo, useDeferredValue } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { MonsterStatblock } from "@/components/monster-statblock";
import { MonsterDescription } from "@/components/statblock/monster-description";

// Memoized so the urgent render pass costs nothing: `useDeferredValue` hands
// back the *previous* value during that pass, so both children bail out on
// reference equality and the redraw happens in the later, interruptible pass.
// Without memo the children re-render urgently anyway and deferring buys
// nothing.
const MemoStatblock = memo(MonsterStatblock);
const MemoDescription = memo(MonsterDescription);

export function StatblockPreview() {
  const { control } = useFormContext<Monster>();
  const values = useWatch({ control }) as Monster;
  const creature = useDeferredValue(values);

  return (
    <>
      <MemoStatblock creature={creature} />
      <MemoDescription description={creature.description} className="mt-4" />
    </>
  );
}
