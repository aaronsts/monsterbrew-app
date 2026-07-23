"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { autocompletion } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  isolateHistory,
} from "@codemirror/commands";
import {
  EditorState,
  RangeSetBuilder,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  placeholder as cmPlaceholder,
  keymap,
} from "@codemirror/view";
import type { TagItem } from "@/lib/tag-catalog";
import type { DecorationSet } from "@codemirror/view";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import type { MarkupContext } from "@/lib/statblock-markup";
import { compositeProblems, markupLint } from "@/lib/markup-lint";
import { keySegments, tokenKeyContaining } from "@/lib/token-keys";
import { TAG_CATALOG } from "@/lib/tag-catalog";
import { cn } from "@/lib/utils";
import { parseMarkup, resolveTag } from "@/lib/statblock-markup";

export interface MarkupEditorHandle {
  /**
   * Insert a snippet at the cursor (replacing any selection). Returns the
   * insert offset and the resulting document so the caller can locate a
   * just-inserted token.
   */
  insertSnippet: (snippet: string) => { at: number; value: string } | null;
  /**
   * Splice a rewritten token back into the document (popover field edits).
   * Dispatching into CM directly — rather than round-tripping through the
   * controlled value — keeps selection mapping, history, and the open
   * popover intact; the caret is pinned just inside the rewritten token.
   */
  replaceRange: (from: number, to: number, insert: string) => void;
  focus: () => void;
}

interface MarkupEditorProps {
  id?: string;
  value: string;
  placeholder?: string;
  /** Token whose editor popover is open — kept raw + tinted stronger. */
  activeKey: string | null;
  /** Creature stats: chips show the token's *resolved* line text. */
  ctx: MarkupContext;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Editable token containing the selection head, on every caret move. */
  onCaretToken: (key: string | null) => void;
  /** An autocomplete completion inserted this tag's snippet at `at`. */
  onTagInserted: (tag: TagItem, value: string, at: number) => void;
}

const setActiveToken = StateEffect.define<string | null>();
const setMarkupCtx = StateEffect.define<MarkupContext>();

const activeTokenField = StateField.define<string | null>({
  create: () => null,
  update(value, tr) {
    let next = value;
    for (const effect of tr.effects) {
      if (effect.is(setActiveToken)) next = effect.value;
    }
    return next;
  },
});

const markupCtxField = StateField.define<MarkupContext | null>({
  create: () => null,
  update(value, tr) {
    let next = value;
    for (const effect of tr.effects) {
      if (effect.is(setMarkupCtx)) next = effect.value;
    }
    return next;
  },
});

/**
 * Collapsed view of an editable token: its resolved line text as a chip.
 * Clicking it drops the caret just inside the raw tag — the decorations
 * rebuild to raw text and the caret sync opens the popover editor.
 */
class TokenChipWidget extends WidgetType {
  constructor(
    readonly key: string,
    readonly display: string,
  ) {
    super();
  }

  eq(other: TokenChipWidget): boolean {
    return other.key === this.key && other.display === this.display;
  }

  toDOM(view: EditorView): HTMLElement {
    const span = document.createElement("span");
    span.className = "mb-chip";
    span.dataset.tokenKey = this.key;
    span.textContent = this.display;
    span.onmousedown = (event) => {
      event.preventDefault();
      const pos = view.posAtDOM(span);
      view.dispatch({ selection: { anchor: pos + 2 } });
      view.focus();
    };
    return span;
  }

  ignoreEvent(): boolean {
    return true;
  }
}

/**
 * Live-preview decorations: an editable token renders as a resolved-text
 * chip while the caret is elsewhere, and as raw tagged text (tinted, with
 * `data-token-key` for popover anchoring) while the caret is inside it or
 * its editor popover is open.
 */
function buildTokenDecorations(state: EditorState): DecorationSet {
  const text = state.doc.toString();
  const ctx = state.field(markupCtxField);
  const activeKey = state.field(activeTokenField);
  const head = state.selection.main.head;
  const builder = new RangeSetBuilder<Decoration>();
  for (const { seg, key } of keySegments(parseMarkup(text))) {
    if (key === null || seg.type !== "tag") continue;
    const caretInside = head > seg.start && head < seg.end;
    const isActive = key === activeKey;

    const chippable =
      !seg.raw.includes("\n") && compositeProblems(seg).length === 0;
    if (ctx && !caretInside && !isActive && chippable) {
      builder.add(
        seg.start,
        seg.end,
        Decoration.replace({
          widget: new TokenChipWidget(key, resolveTag(seg, ctx)),
        }),
      );
    } else {
      builder.add(
        seg.start,
        seg.end,
        Decoration.mark({
          class: isActive ? "mb-token mb-token-active" : "mb-token",
          attributes: { "data-token-key": key },
        }),
      );
    }
  }
  return builder.finish();
}

const tokenDecorations = StateField.define<DecorationSet>({
  create: (state) => buildTokenDecorations(state),
  update(deco, tr) {
    if (
      tr.docChanged ||
      tr.selection !== undefined ||
      tr.effects.some((e) => e.is(setActiveToken) || e.is(setMarkupCtx))
    ) {
      return buildTokenDecorations(tr.state);
    }
    return deco;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/** Match the shadcn Textarea's inner metrics (px-2.5 py-2 text-xs). */
const editorTheme = EditorView.theme({
  "&": { minHeight: "calc(4rem - 2px)", fontSize: "12px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "inherit", lineHeight: "16px" },
  ".cm-content": { padding: "8px 10px", caretColor: "var(--foreground)" },
  ".cm-line": { padding: "0" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
});

export const MarkupEditor = forwardRef<MarkupEditorHandle, MarkupEditorProps>(
  function MarkupEditor(
    {
      id,
      value,
      placeholder,
      activeKey,
      ctx,
      onChange,
      onBlur,
      onCaretToken,
      onTagInserted,
    },
    handleRef,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const initialValueRef = useRef(value);

    const callbacksRef = useRef({
      onChange,
      onBlur,
      onCaretToken,
      onTagInserted,
    });
    callbacksRef.current = { onChange, onBlur, onCaretToken, onTagInserted };

    useEffect(() => {
      function tagCompletions(
        context: CompletionContext,
      ): CompletionResult | null {
        const match = context.matchBefore(/\{@\w*/);
        if (!match) return null;
        return {
          from: match.from,
          options: TAG_CATALOG.map((tag) => ({
            label: `{@${tag.name}`,
            displayLabel: tag.title,
            detail: tag.snippet.trim(),
            info: tag.hint,
            apply: (view: EditorView, _c, from: number, to: number) => {
              view.dispatch({
                changes: { from, to, insert: tag.snippet },
                selection: { anchor: from + tag.snippet.length },
                userEvent: "input.complete",
                // Each snippet insert is its own undo step.
                annotations: isolateHistory.of("full"),
              });
              callbacksRef.current.onTagInserted(
                tag,
                view.state.doc.toString(),
                from,
              );
            },
          })),
        };
      }

      const view = new EditorView({
        parent: containerRef.current ?? undefined,
        state: EditorState.create({
          doc: initialValueRef.current,
          extensions: [
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            EditorView.lineWrapping,
            // Order matters: tokenDecorations reads these two fields.
            activeTokenField,
            markupCtxField,
            tokenDecorations,
            autocompletion({ override: [tagCompletions], icons: false }),
            markupLint(),
            placeholder ? cmPlaceholder(placeholder) : [],
            id ? EditorView.contentAttributes.of({ id }) : [],
            editorTheme,
            EditorView.domEventHandlers({
              blur: () => callbacksRef.current.onBlur?.(),
            }),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                callbacksRef.current.onChange(update.state.doc.toString());
              }
              if (update.selectionSet || update.docChanged) {
                callbacksRef.current.onCaretToken(
                  tokenKeyContaining(
                    update.state.doc.toString(),
                    update.state.selection.main.head,
                  ),
                );
              }
            }),
          ],
        }),
      });
      viewRef.current = view;
      return () => {
        viewRef.current = null;
        view.destroy();
      };
    }, [id, placeholder]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const current = view.state.doc.toString();
      if (value !== current) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: value },
        });
      }
    }, [value]);

    useEffect(() => {
      viewRef.current?.dispatch({ effects: setActiveToken.of(activeKey) });
    }, [activeKey]);

    // Chips re-resolve their display text whenever the creature changes.
    useEffect(() => {
      viewRef.current?.dispatch({ effects: setMarkupCtx.of(ctx) });
    }, [ctx]);

    useImperativeHandle(handleRef, () => ({
      insertSnippet(snippet) {
        const view = viewRef.current;
        if (!view) return null;
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: snippet },
          selection: { anchor: from + snippet.length },
          userEvent: "input.complete",
          // Each snippet insert is its own undo step.
          annotations: isolateHistory.of("full"),
        });
        return { at: from, value: view.state.doc.toString() };
      },
      replaceRange(from, to, insert) {
        const view = viewRef.current;
        if (!view) return;
        view.dispatch({
          changes: { from, to, insert },
          // Keep the caret inside the token (before its closing brace) so
          // the caret sync doesn't close the popover as the token resizes.
          selection: { anchor: Math.max(from, from + insert.length - 1) },
          userEvent: "input",
        });
      },
      focus() {
        viewRef.current?.focus();
      },
    }));

    return (
      <div
        ref={containerRef}
        className={cn(
          "min-h-16 w-full rounded-none border border-input bg-transparent text-xs transition-colors",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          "dark:bg-input/30",
        )}
      />
    );
  },
);
