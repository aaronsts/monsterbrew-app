import { Suspense } from "react";
import Editor from "./components/editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonsterForm } from "./components/monster-form";

export default async function CreatureEditor() {
  return (
    <Suspense>
      <div className="space-y-4">
        <Card>
          <CardContent>
            <MonsterForm />
          </CardContent>
        </Card>
        <Editor />
      </div>
    </Suspense>
  );
}
