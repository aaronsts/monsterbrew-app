import { Languages } from "@/schema/createCreatureSchema";

const KNOWN_LANGUAGES = new Set<string>(Object.values(Languages));

export function partitionLanguages(values: Array<string>): {
  languages: Array<Languages>;
  custom_languages: Array<string>;
} {
  const languages: Array<Languages> = [];
  const custom_languages: Array<string> = [];
  for (const value of values) {
    if (KNOWN_LANGUAGES.has(value)) {
      languages.push(value as Languages);
    } else {
      custom_languages.push(value);
    }
  }
  return { languages, custom_languages };
}
