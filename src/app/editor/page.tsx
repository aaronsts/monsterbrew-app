import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MonsterForm } from "./components/monster-form";

export default async function CreatureEditor() {
  return (
    <Suspense>
      <Card>
        <CardContent>
          <MonsterForm />
        </CardContent>
      </Card>
    </Suspense>
  );
}
