"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import type { MarkupContext } from "@/lib/statblock-markup";
import { resolveMarkup } from "@/lib/statblock-markup";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ABILITIES = [
  ["str", "STR"],
  ["dex", "DEX"],
  ["con", "CON"],
  ["int", "INT"],
  ["wis", "WIS"],
  ["cha", "CHA"],
] as const;

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

/**
 * A description `<Textarea>` with an "Insert" menu for Monsterbrew's `{@…}`
 * stat tags and a live preview of how the text resolves against the creature's
 * current ability scores / proficiency bonus. Hand-typing tags works without
 * the menu; the menu just saves you remembering the syntax.
 */
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

  function insert(snippet: string) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + snippet + value.slice(end));
    // Restore the caret just after the inserted snippet on the next frame,
    // once React has committed the new value.
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const hasTags = value.includes("{@");

  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-2">
        <Textarea
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                title="Insert stat tag"
              />
            }
          >
            <Sparkles />
            <span className="sr-only">Insert stat tag</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Insert stat tag</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => insert("{@atkr m} ")}>
                Melee attack roll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insert("{@atkr r} ")}>
                Ranged attack roll
              </DropdownMenuItem>
              <AbilitySub
                label="To hit (mod + PB)"
                onPick={(a) => insert(`{@hit ${a}} `)}
              />
              <AbilitySub label="Save DC" onPick={(a) => insert(`{@dc ${a}}`)} />
              <DropdownMenuItem onClick={() => insert("{@damage 1d6 + str}")}>
                Damage (edit dice)
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => insert("{@h}")}>
                Hit: label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insert("{@actSaveFail} ")}>
                Failure: label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insert("{@actSaveSuccess} ")}>
                Success: label
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insert(" {@recharge 5}")}>
                Recharge 5–6
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasTags && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Preview: </span>
          {resolveMarkup(value, ctx)}
        </p>
      )}
    </div>
  );
}

function AbilitySub({
  label,
  onPick,
}: {
  label: string;
  onPick: (ability: string) => void;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {ABILITIES.map(([key, short]) => (
          <DropdownMenuItem key={key} onClick={() => onPick(key)}>
            {short}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
