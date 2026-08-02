"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { TOKEN_EDITORS } from "../../token-editors";
import { TokenEditorDialog } from "./token-editor-dialog";
import { MarkupEditor } from "./markup-editor";
import { TagHelpDialog } from "./tag-help-dialog";
import type { MarkupEditorHandle } from "./markup-editor";
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
  ctx: MarkupContext;
  tags?: Array<TagItem>;
}

export function MarkupField({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  ctx,
  tags = TAG_CATALOG,
}: Readonly<MarkupFieldProps>) {
  const editorRef = useRef<MarkupEditorHandle>(null);
  /** Key of the token whose editor dialog is open (see tokenKeyAt). */
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [freshToken, setFreshToken] = useState<string | null>(null);

  /** Composites open their editor dialog right away after an insert. */
  function afterInsert(tag: TagItem, nextValue: string, at: number) {
    if (TOKEN_EDITORS[tag.name]) {
      const key = tokenKeyAt(nextValue, at);
      setActiveToken(key);
      setFreshToken(key);
    }
  }

  /** Insert the tag's snippet at the cursor (used by the reference list). */
  function insertAtCaret(tag: TagItem) {
    const inserted = editorRef.current?.insertSnippet(tag.snippet);
    if (!inserted) return;
    afterInsert(tag, inserted.value, inserted.at);
    if (!TOKEN_EDITORS[tag.name]) editorRef.current?.focus();
  }

  /** The dialog only ever reports closes; opens go through setActiveToken. */
  function handleOpenChange(open: boolean) {
    if (open) return;
    setActiveToken(null);
    setFreshToken(null);
    // Hand focus back to the text so editing continues where it left off.
    editorRef.current?.focus();
  }

  return (
    <div className="grid gap-1.5">
      <MarkupEditor
        ref={editorRef}
        id={id}
        value={value}
        placeholder={placeholder}
        activeKey={activeToken}
        ctx={ctx}
        onChange={onChange}
        onBlur={onBlur}
        onTokenClick={setActiveToken}
        onTagInserted={afterInsert}
      />

      <TokenEditorDialog
        value={value}
        ctx={ctx}
        activeKey={activeToken}
        isNew={activeToken !== null && activeToken === freshToken}
        onRewrite={(from, to, insert) =>
          editorRef.current?.replaceRange(from, to, insert)
        }
        onOpenChange={handleOpenChange}
      />

      <div className="flex flex-wrap items-center gap-1">
        {tags.map((tag) => (
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
