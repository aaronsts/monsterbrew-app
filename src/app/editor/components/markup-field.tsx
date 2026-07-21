"use client";

import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { MarkupContext } from "@/lib/statblock-markup";
import { resolveMarkup } from "@/lib/statblock-markup";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TagItem {
  snippet: string;
  name: string;
  title: string;
  hint: string;
}

const TAG_CATALOG: Array<TagItem> = [
  {
    snippet: "{@atkr m} ",
    name: "atkr",
    title: "Melee attack roll",
    hint: "Melee Attack Roll:",
  },
  {
    snippet: "{@atkr r} ",
    name: "atkr",
    title: "Ranged attack roll",
    hint: "Ranged Attack Roll:",
  },
  {
    snippet: "{@hit str} ",
    name: "hit",
    title: "To hit",
    hint: "mod + PB — swap the ability",
  },
  { snippet: "{@h}", name: "h", title: "Hit: label", hint: "Hit:" },
  {
    snippet: "{@damage 1d6 + str}",
    name: "damage",
    title: "Damage",
    hint: "average + dice — edit the roll",
  },
  { snippet: "{@dc con}", name: "dc", title: "Save DC", hint: "8 + PB + mod" },
  {
    snippet: "{@actSave dex} ",
    name: "actSave",
    title: "Saving throw",
    hint: "Dexterity Saving Throw:",
  },
  {
    snippet: "{@actSaveFail} ",
    name: "actSaveFail",
    title: "Failure label",
    hint: "Failure:",
  },
  {
    snippet: "{@actSaveSuccess} ",
    name: "actSaveSuccess",
    title: "Success label",
    hint: "Success:",
  },
  {
    snippet: "{@recharge 5}",
    name: "recharge",
    title: "Recharge",
    hint: "(Recharge 5–6)",
  },
  {
    snippet: "{@dice 1d6}",
    name: "dice",
    title: "Inline dice",
    hint: "1d6 (no average)",
  },
  {
    snippet: "{@condition prone}",
    name: "condition",
    title: "Condition",
    hint: "reference — source dropped",
  },
  {
    snippet: "{@spell fireball}",
    name: "spell",
    title: "Spell",
    hint: "reference — source dropped",
  },
];

/**
 * If the caret sits inside an in-progress `{@word` (name still being typed,
 * before any space/args), return where the tag starts and the partial query.
 */
function findTagQuery(
  value: string,
  caret: number,
): { start: number; query: string } | null {
  const match = value.slice(0, caret).match(/\{@(\w*)$/);
  if (!match) return null;
  return { start: caret - match[0].length, query: match[1] };
}

function filterTags(query: string): Array<TagItem> {
  const q = query.toLowerCase();
  if (!q) return TAG_CATALOG;
  return TAG_CATALOG.filter((t) =>
    `${t.name} ${t.title}`.toLowerCase().includes(q),
  );
}

interface MarkupFieldProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Creature stats used to resolve stat-linked tags in the live preview. */
  ctx: MarkupContext;
}

export function MarkupField({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  ctx,
}: MarkupFieldProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<{ start: number; query: string } | null>(
    null,
  );
  const [active, setActive] = useState(0);

  const suggestions = menu ? filterTags(menu.query) : [];
  const showMenu = menu !== null && suggestions.length > 0;

  function refreshMenu(el: HTMLTextAreaElement) {
    setMenu(findTagQuery(el.value, el.selectionStart ?? 0));
    setActive(0);
  }

  function focusCaret(pos: number) {
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  /** Insert `snippet` at the caret (used by the reference list). */
  function insertAtCaret(snippet: string) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + snippet + value.slice(end));
    focusCaret(start + snippet.length);
  }

  /** Replace the in-progress `{@query` with the chosen tag. */
  function acceptSuggestion(tag: TagItem) {
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const found = findTagQuery(value, caret);
    const start = found ? found.start : caret;
    onChange(value.slice(0, start) + tag.snippet + value.slice(caret));
    setMenu(null);
    focusCaret(start + tag.snippet.length);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showMenu) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
      case "Tab":
        event.preventDefault();
        acceptSuggestion(suggestions[active]);
        break;
      case "Escape":
        event.preventDefault();
        setMenu(null);
        break;
    }
  }

  const hasTags = value.includes("{@");

  return (
    <div className="grid gap-1.5">
      <div className="relative">
        <Textarea
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            refreshMenu(e.currentTarget);
          }}
          onSelect={(e) => refreshMenu(e.currentTarget)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
        />

        {showMenu && (
          <ul
            role="listbox"
            aria-label="Tag suggestions"
            className="absolute top-full left-0 z-50 mt-1 max-h-56 w-full overflow-y-auto border bg-popover text-popover-foreground shadow-md"
          >
            {suggestions.map((tag, i) => (
              <li key={tag.snippet}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  // Keep textarea focus so the caret is where we splice.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => acceptSuggestion(tag)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-3 px-2.5 py-1.5 text-left text-xs",
                    i === active
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  <span className="font-medium">{tag.title}</span>
                  <code className="shrink-0 text-[11px] text-muted-foreground">
                    {tag.snippet.trim()}
                  </code>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasTags && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Preview: </span>
          {resolveMarkup(value, ctx)}
        </p>
      )}

      <details className="group text-xs [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-muted-foreground select-none hover:text-foreground">
          <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
          Tag reference — click to insert
        </summary>
        <div className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {TAG_CATALOG.map((tag) => (
            <Button
              key={tag.snippet}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertAtCaret(tag.snippet)}
              className="flex justify-between gap-0.5 border px-2 py-1.5 text-left "
            >
              <span className="text-[11px] text-muted-foreground">
                {tag.hint}
              </span>
              <code className="text-[11px] font-medium">
                {tag.snippet.trim()}
              </code>
            </Button>
          ))}
        </div>
      </details>
    </div>
  );
}
