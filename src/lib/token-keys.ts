import { TOKEN_EDITORS } from "../app/editor/components/token-editors";
import type { Segment } from "@/lib/statblock-markup";
import { parseMarkup } from "@/lib/statblock-markup";

export interface KeyedSegment {
  seg: Segment;
  /** Stable id (`name:occurrence`) for registry tags; null otherwise. */
  key: string | null;
}

/**
 * Key registry-editable tags by name + occurrence index so the active
 * editor dialog survives value edits (offsets shift on every keystroke, but
 * "the 2nd {@attack}" stays the 2nd {@attack}).
 */
export function keySegments(segments: Array<Segment>): Array<KeyedSegment> {
  const counts = new Map<string, number>();
  return segments.map((seg) => {
    if (seg.type !== "tag" || !TOKEN_EDITORS[seg.name]) {
      return { seg, key: null };
    }
    const occurrence = counts.get(seg.name) ?? 0;
    counts.set(seg.name, occurrence + 1);
    return { seg, key: `${seg.name}:${occurrence}` };
  });
}

/**
 * Key of the editable token starting at source offset `start` in `value`,
 * or null if there is none. Lets `MarkupField` open a just-inserted token's
 * editor dialog by passing the result as its `activeKey`.
 */
export function tokenKeyAt(value: string, start: number): string | null {
  const match = keySegments(parseMarkup(value)).find(
    (k) => k.key !== null && k.seg.start === start,
  );
  return match?.key ?? null;
}
