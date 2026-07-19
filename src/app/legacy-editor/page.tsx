import { Suspense } from "react";
import Editor from "./components/editor";

export default async function LegacyCreatureEditor() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
