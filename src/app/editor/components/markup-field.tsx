"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { MarkupEditor } from "./markup-editor";
import { TagHelpDialog } from "./tag-help-dialog";
import { TokenEditorPopover } from "./token-editor-popover";
import { TOKEN_EDITORS } from "./token-editors";
import type { MarkupEditorHandle } from "./markup-editor";
import type { TokenOpenChangeDetails } from "./token-editor-popover";
import type { TagItem } from "@/lib/tag-catalog";
import type { MarkupContext } from "@/lib/statblock-markup";
import { TAG_CATALOG } from "@/lib/tag-catalog";
import { tokenKeyAt } from "@/lib/token-keys";
import { Button } from "@/components/ui/button";

interface MarkupFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Creature stats used to resolve stat-linked tags in the live preview. */
  ctx: MarkupContext;
}

export function MarkupField({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  ctx,
}: Readonly<MarkupFieldProps>) {
  const editorRef = useRef<MarkupEditorHandle>(null);
  /** The editor's box — presses inside it are caret moves, not dismissals. */
  const editorBoxRef = useRef<HTMLDivElement>(null);
  /** Key of the preview token whose editor popover is open (see tokenKeyAt). */
  const [activeToken, setActiveToken] = useState<string | null>(null);
  /** Caret-driven opens must not pull focus out of the editor. */
  const [openedByCaret, setOpenedByCaret] = useState(false);
  /** Token dismissed with Escape: stay closed until the caret leaves it. */
  const suppressedRef = useRef<string | null>(null);

  /** CodeMirror reports the token under the selection head on every move. */
  function handleCaretToken(key: string | null) {
    if (key !== suppressedRef.current) suppressedRef.current = null;
    const next = key === suppressedRef.current ? null : key;
    if (next !== null) setOpenedByCaret(true);
    setActiveToken(next);
  }

  /** Chip clicks and popover dismissals arrive here from the preview. */
  function handleActiveKeyChange(
    key: string | null,
    details?: TokenOpenChangeDetails,
  ) {
    if (key === null && details?.reason === "outside-press") {
      const target = details.event?.target;

      if (target instanceof Node && editorBoxRef.current?.contains(target)) {
        return;
      }
    }
    if (key === null && details?.reason === "escape-key") {
      suppressedRef.current = activeToken;
    }
    if (key !== null) setOpenedByCaret(false);
    setActiveToken(key);
  }

  /** Composites open their chip editor right away after an insert. */
  function afterInsert(tag: TagItem, nextValue: string, at: number) {
    if (TOKEN_EDITORS[tag.name]) {
      setOpenedByCaret(false);
      setActiveToken(tokenKeyAt(nextValue, at));
    }
  }

  /** Insert the tag's snippet at the cursor (used by the reference list). */
  function insertAtCaret(tag: TagItem) {
    const inserted = editorRef.current?.insertSnippet(tag.snippet);
    if (!inserted) return;
    afterInsert(tag, inserted.value, inserted.at);
    if (!TOKEN_EDITORS[tag.name]) editorRef.current?.focus();
  }

  return (
    <div className="grid gap-1.5">
      <div ref={editorBoxRef}>
        <MarkupEditor
          ref={editorRef}
          id={id}
          value={value}
          placeholder={placeholder}
          activeKey={activeToken}
          ctx={ctx}
          onChange={onChange}
          onBlur={onBlur}
          onCaretToken={handleCaretToken}
          onTagInserted={afterInsert}
        />
      </div>

      <TokenEditorPopover
        value={value}
        ctx={ctx}
        activeKey={activeToken}
        anchor={() =>
          // Keys are internal (`name:occurrence`), safe in a quoted selector.
          activeToken
            ? (editorBoxRef.current?.querySelector(
                `[data-token-key="${activeToken}"]`,
              ) ?? null)
            : null
        }
        onRewrite={(from, to, insert) =>
          editorRef.current?.replaceRange(from, to, insert)
        }
        onOpenChange={(open, details) =>
          handleActiveKeyChange(open ? activeToken : null, details)
        }
        focusPopover={!openedByCaret}
      />

      <div className="flex flex-wrap items-center gap-1">
        {TAG_CATALOG.map((tag) => (
          <Button
            key={tag.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertAtCaret(tag)}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Plus className="size-3" />
            {tag.title}
          </Button>
        ))}
        <TagHelpDialog />
      </div>
    </div>
  );
}
