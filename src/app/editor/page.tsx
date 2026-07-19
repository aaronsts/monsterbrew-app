import { Suspense } from "react";
import Editor from "./components/editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, useForm, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@base-ui/react";
import { IdentityForm } from "./components/identity-form";
import { CombatForm } from "./components/combat-form";
import { DefenseForm } from "./components/defense-form";

export default async function CreatureEditor() {
  return (
    <Suspense>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <IdentityForm />
            <CombatForm />
            <DefenseForm />
          </CardContent>
        </Card>
        <Editor />
      </div>
    </Suspense>
  );
}
