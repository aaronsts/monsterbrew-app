"use client";

import { useState } from "react";
import { TOKEN_EDITORS } from "../../token-editors";
import type { AnyTokenEditor } from "../../token-editors";
import type { MarkupContext } from "@/lib/statblock-markup";
import { keySegments } from "@/lib/token-keys";
import {
  abilityName,
  damageAverage,
  dcValue,
  hitBonus,
  parseAttackArgs,
  parseMarkup,
  parseSaveArgs,
  resolveMarkup,
} from "@/lib/statblock-markup";
import { formatMod } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TokenEditorDialogProps {
  /** The raw description markup — the single source of truth. */
  value: string;
  ctx: MarkupContext;
  /** Key of the token being edited (null = closed). */
  activeKey: string | null;
  isNew?: boolean;
  /** Splice `insert` over `[from, to)` — dispatched straight into CM. */
  onRewrite: (from: number, to: number, insert: string) => void;
  onOpenChange: (open: boolean) => void;
}

/** The rendered clause for one damage slot, e.g. `7 (2d6) Fire damage`. */
function damagePreview(dice: string, type: string, ctx: MarkupContext): string {
  if (!dice.trim()) return "";
  return resolveMarkup(`{@damage ${dice}${type ? `|${type}` : ""}}`, ctx);
}

interface TokenSummary {
  /** Computed substrings of the preview, tinted in output order. */
  highlights: Array<string>;
  stats: Array<{ label: string; value: string }>;
}

function summarize(
  name: string,
  args: string,
  ctx: MarkupContext,
): TokenSummary {
  if (name === "attack") {
    const f = parseAttackArgs(args);
    const hit = f.hit ? formatMod(hitBonus(f.hit, ctx)) : "";
    const clauses = [
      damagePreview(f.dice, f.type, ctx),
      damagePreview(f.dice2, f.type2, ctx),
    ].filter(Boolean);
    const average = damageAverage(f.dice, ctx) + damageAverage(f.dice2, ctx);
    return {
      highlights: [hit, ...clauses].filter(Boolean),
      stats: [
        { label: "To hit", value: hit || "—" },
        {
          label: "Average damage",
          value: clauses.length ? `${average}` : "—",
        },
      ],
    };
  }
  const f = parseSaveArgs(args);
  const dc = f.dc ? `DC ${dcValue(f.dc, ctx)}` : "";
  const damage = damagePreview(f.dice, f.type, ctx);
  const onSave = f.onSave || (f.dice ? "half" : "");
  return {
    highlights: [
      abilityName(f.ability),
      dc,
      damage,
      onSave === "half" ? "Half damage" : "",
    ].filter(Boolean),
    stats: [
      { label: "Save DC", value: f.dc ? `${dcValue(f.dc, ctx)}` : "—" },
      {
        label: "Average damage",
        value: damage ? `${damageAverage(f.dice, ctx)}` : "—",
      },
    ],
  };
}

/** The preview line with its computed parts tinted. */
function HighlightedPreview({
  text,
  highlights,
}: {
  text: string;
  highlights: Array<string>;
}) {
  const nodes: Array<React.ReactNode> = [];
  let cursor = 0;
  for (const highlight of highlights) {
    const at = text.indexOf(highlight, cursor);
    if (at === -1) continue;
    if (at > cursor) nodes.push(text.slice(cursor, at));
    nodes.push(
      <span key={at} className="font-medium text-accent">
        {highlight}
      </span>,
    );
    cursor = at + highlight.length;
  }
  nodes.push(text.slice(cursor));
  return <p className="mt-2 text-xs/relaxed">{nodes}</p>;
}

interface TokenEditorBodyProps {
  name: string;
  editor: AnyTokenEditor;
  initialArgs: string;
  ctx: MarkupContext;
  isNew: boolean;
  onCancel: () => void;
  onConfirm: (args: string) => void;
}

function TokenEditorBody({
  name,
  editor,
  initialArgs,
  ctx,
  isNew,
  onCancel,
  onConfirm,
}: Readonly<TokenEditorBodyProps>) {
  const [fields, setFields] = useState<unknown>(() =>
    editor.parse(initialArgs),
  );
  const Editor = editor.Editor;
  const args = editor.serialize(fields);
  const preview = resolveMarkup(`{@${name} ${args}}`, ctx);
  const { highlights, stats } = summarize(name, args, ctx);

  return (
    <>
      <DialogHeader className="border-b px-4 py-3">
        <DialogTitle className="text-base">{editor.label}</DialogTitle>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid h-full sm:grid-cols-[minmax(0,1fr)_240px]">
          <div className="p-4">
            <Editor value={fields} ctx={ctx} onChange={setFields} />
          </div>
          <aside className="border-t bg-card p-4 sm:border-t-0 sm:border-l">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Preview
            </p>
            <HighlightedPreview text={preview} highlights={highlights} />
            <Separator className="my-3" />
            <dl className="grid gap-1.5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between gap-2 text-xs"
                >
                  <dt className="text-muted-foreground">{stat.label}</dt>
                  <dd className="tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
      <DialogFooter className="border-t px-4 py-3">
        <Button
          type="button"
          color="neutral"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="button" color="accent" onClick={() => onConfirm(args)}>
          {isNew ? `Add ${editor.label.toLowerCase()}` : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function TokenEditorDialog({
  value,
  ctx,
  activeKey,
  isNew = false,
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

  return (
    <Dialog open onOpenChange={(open) => onOpenChange(open)}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <TokenEditorBody
          key={activeKey}
          name={seg.name}
          editor={editor}
          initialArgs={seg.args}
          ctx={ctx}
          isNew={isNew}
          onCancel={() => {
            if (isNew) onRewrite(seg.start, seg.end, "");
            onOpenChange(false);
          }}
          onConfirm={(args) => {
            onRewrite(seg.start, seg.end, `{@${seg.name} ${args}}`);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
