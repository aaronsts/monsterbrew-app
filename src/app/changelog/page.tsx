import { Suspense } from "react";
import Markdown from "react-markdown";

export default function Changelog() {
  const changelogContent = `# Changelog

## 2.0.0 - ${new Date().toISOString().split("T")[0]}
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
