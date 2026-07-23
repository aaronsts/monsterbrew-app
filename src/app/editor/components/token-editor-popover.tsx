"use client";

import { TOKEN_EDITORS } from "./token-editors";
import type { MarkupContext } from "@/lib/statblock-markup";
import { keySegments } from "@/lib/token-keys";
import { parseMarkup } from "@/lib/statblock-markup";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";

/**
 * Structural subset of Base UI's open-change event details that owners need
 * to police closes (e.g. ignore an outside-press that landed in the editor,
 * or suppress reopening after `escape-key`).
 */
export interface TokenOpenChangeDetails {
  reason?: string;
  event?: Event;
}

interface TokenEditorPopoverProps {
  /** The raw description markup — the single source of truth. */
  value: string;
  ctx: MarkupContext;
  /** Key of the token being edited (null = closed). */
  activeKey: string | null;
  /** Positioning anchor — the in-editor `[data-token-key]` span. */
  anchor: () => Element | null;
  /** Splice `insert` over `[from, to)` — dispatched straight into CM. */
  onRewrite: (from: number, to: number, insert: string) => void;
  onOpenChange: (open: boolean, details?: TokenOpenChangeDetails) => void;
  /** False for caret-driven opens so the user keeps typing in the editor. */
  focusPopover: boolean;
}

/**
 * The structured editor popover for the active token, anchored to its raw
 * text inside the CodeMirror field. Fields re-derive from the live token
 * args on every render, so the popover is a controlled view over the
 * document — typing in either surface keeps the other in sync. Field edits
 * splice the rebuilt tag back by exact offsets.
 */
export function TokenEditorPopover({
  value,
  ctx,
  activeKey,
  anchor,
  onRewrite,
  onOpenChange,
  focusPopover,
}: Readonly<TokenEditorPopoverProps>) {
  if (activeKey === null) return null;
  const match = keySegments(parseMarkup(value)).find(
    (k) => k.key === activeKey,
  );
  if (match?.seg.type !== "tag") return null;

  const seg = match.seg;
  const editor = TOKEN_EDITORS[seg.name];
  const Editor = editor.Editor;
  const fields = editor.parse(seg.args);

  return (
    <Popover open onOpenChange={(next, details) => onOpenChange(next, details)}>
      <PopoverContent
        anchor={anchor}
        align="start"
        className="w-80"
        initialFocus={focusPopover ? undefined : false}
      >
        <PopoverHeader>
          <PopoverTitle className="mb-0">{editor.label}</PopoverTitle>
        </PopoverHeader>
        <Editor
          value={fields}
          ctx={ctx}
          onChange={(next) =>
            onRewrite(
              seg.start,
              seg.end,
              `{@${seg.name} ${editor.serialize(next)}}`,
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
