import Markdown from "react-markdown";

export default function Changelog() {
  const changelogContent = `# Changelog

## 2.2.0 - 2025-05-11


## 2.1.0 - 2025-05-07
Minor UI improvements for number inputs and accessibility.
- Add Mythic Actions
- Convert inputs for stats / ac to number inputs
- Add better accessibility for buttons
- Add overwrite for passive perception

## 2.0.0 - 2025-05-01
### Major Update
Version 2.0 of Monsterbrew is finally here. It's been almost a year since the last update! This version brings a complete UI overhaul and improved creature creating! The biggest change is the live form updating. Besides this feature, there are a ton of other improvements as well.

### Features
- Complete UI redesign with improved accessibility and mobile responsiveness
- Improved import converters
- Ability to save creatures locally
- Print-optimized layout for statblocks
- New 2025 statblock design`;

  return (
    <section className="prose max-w-8xl px-6">
      <Markdown>{changelogContent}</Markdown>
    </section>
  );
}
