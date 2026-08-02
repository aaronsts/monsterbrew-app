"use client";

import { TOKEN_EDITORS } from "../../token-editors";
import type { MarkupContext } from "@/lib/statblock-markup";
import { keySegments } from "@/lib/token-keys";
import { parseMarkup, resolveTag } from "@/lib/statblock-markup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TokenEditorDialogProps {
  /** The raw description markup — the single source of truth. */
  value: string;
  ctx: MarkupContext;
  /** Key of the token being edited (null = closed). */
  activeKey: string | null;
  /** Splice `insert` over `[from, to)` — dispatched straight into CM. */
  onRewrite: (from: number, to: number, insert: string) => void;
  onOpenChange: (open: boolean) => void;
}

export function TokenEditorDialog({
  value,
  ctx,
  activeKey,
  onRewrite,
  onOpenChange,
}: Readonly<TokenEditorDialogProps>) {
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
    <Dialog open onOpenChange={(open) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editor.label}</DialogTitle>
        </DialogHeader>
        <p className="bg-primary/20 border p-2 text-xs/relaxed ">
          {resolveTag(seg, ctx)}
        </p>
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
      </DialogContent>
    </Dialog>
  );
}
