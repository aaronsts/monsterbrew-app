import { linter } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import type { TagSegment } from "@/lib/statblock-markup";
import {
  KNOWN_TAG_NAMES,
  parseMarkup,
  validateAttackArgs,
  validateSaveArgs,
} from "@/lib/statblock-markup";

export function compositeProblems(seg: TagSegment): Array<string> {
  if (seg.name === "attack") return validateAttackArgs(seg.args);
  if (seg.name === "save") return validateSaveArgs(seg.args);
  return [];
}

export function markupLint() {
  return linter(
    (view) => {
      const diagnostics: Array<Diagnostic> = [];
      for (const seg of parseMarkup(view.state.doc.toString())) {
        if (seg.type === "text") {
          const opener = seg.value.indexOf("{@");
          if (opener !== -1) {
            diagnostics.push({
              from: seg.start + opener,
              to: seg.end,
              severity: "error",
              message: "Unclosed {@…} tag — missing “}”.",
            });
          }
          continue;
        }
        if (!KNOWN_TAG_NAMES.has(seg.name)) {
          diagnostics.push({
            from: seg.start,
            to: seg.end,
            severity: "warning",
            message: `Unknown tag "@${seg.name}" — it will render as plain text.`,
          });
          continue;
        }
        for (const problem of compositeProblems(seg)) {
          diagnostics.push({
            from: seg.start,
            to: seg.end,
            severity: "warning",
            message: `@${seg.name}: ${problem}`,
          });
        }
      }
      return diagnostics;
    },
    { delay: 300 },
  );
}
