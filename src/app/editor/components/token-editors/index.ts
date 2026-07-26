import { AttackEditor } from "./attack-editor";
import { SaveEditor } from "./save-editor";
import type { ComponentType } from "react";
import type {
  AttackFields,
  MarkupContext,
  SaveFields,
} from "@/lib/statblock-markup";
import {
  parseAttackArgs,
  parseSaveArgs,
  serializeAttackArgs,
  serializeSaveArgs,
} from "@/lib/statblock-markup";

export interface TokenEditorProps<TFields> {
  value: TFields;
  onChange: (fields: TFields) => void;
  ctx: MarkupContext;
}

/**
 * A structured popover editor for one `{@…}` tag type. `parse`/`serialize`
 * convert between the tag's arg string and a field object the `Editor`
 * component edits; both come from `statblock-markup.ts` so the grammar has a
 * single implementation. Registering a tag here is all it takes to make its
 * chips clickable in `MarkupPreview`.
 */
export interface TokenEditor<TFields> {
  /** Tag name handled, without the leading `@`. */
  name: string;
  /** Popover title. */
  label: string;
  parse: (args: string) => TFields;
  serialize: (fields: TFields) => string;
  Editor: ComponentType<TokenEditorProps<TFields>>;
}

/**
 * Type-erased entry: `MarkupPreview` passes the field object opaquely from
 * `parse` into `Editor` and back through `serialize`, so each entry only has
 * to be internally consistent.
 */
export type AnyTokenEditor = TokenEditor<unknown>;

function erase<TFields>(editor: TokenEditor<TFields>): AnyTokenEditor {
  return editor as unknown as AnyTokenEditor;
}

export const TOKEN_EDITORS: Record<string, AnyTokenEditor> = {
  attack: erase<AttackFields>({
    name: "attack",
    label: "Attack",
    parse: parseAttackArgs,
    serialize: serializeAttackArgs,
    Editor: AttackEditor,
  }),
  save: erase<SaveFields>({
    name: "save",
    label: "Saving throw",
    parse: parseSaveArgs,
    serialize: serializeSaveArgs,
    Editor: SaveEditor,
  }),
};
