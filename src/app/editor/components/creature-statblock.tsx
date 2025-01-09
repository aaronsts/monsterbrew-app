import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function CreatureStatblock() {
  const { watch } = useFormContext<z.infer<typeof createCreatureSchema>>();
  return (
    <Card>
      <CardHeader>
        <p className="text-3xl font-bold small-caps">
          {watch("name") || "Ancient Red Dragon"}
        </p>
        <p>Gargantuan Dragon, {watch("alignment") || "Chaotic Evil"}</p>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default CreatureStatblock;
