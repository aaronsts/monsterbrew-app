export interface TagItem {
  snippet: string;
  name: string;
  title: string;
  hint: string;
}

export const TAG_CATALOG: Array<TagItem> = [
  // Composite-first: one tag = one full line, edited via its preview chip.
  {
    snippet: "{@attack m|str|5|1d6+str|slashing}",
    name: "attack",
    title: "Attack line",
    hint: "full attack — edit via the preview chip",
  },
  {
    snippet: "{@save dex|con|2d6|fire|half}",
    name: "save",
    title: "Saving throw line",
    hint: "full save — edit via the preview chip",
  },
  {
    snippet: "{@recharge 5}",
    name: "recharge",
    title: "Recharge",
    hint: "(Recharge 5–6)",
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
