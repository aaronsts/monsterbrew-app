import { Suspense } from "react";
import { MonsterForm } from "./components/monster-form";

export default async function CreatureEditor() {
  return (
    <Suspense>
      <MonsterForm />
    </Suspense>
  );
}
