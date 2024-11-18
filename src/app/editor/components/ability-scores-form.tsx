import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { calculateStatBonus } from "@/lib/utils";
import {
	abilityScoresSchema,
	createCreatureSchema,
} from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function AbilityScoresForm() {
	const form = useFormContext<z.infer<typeof createCreatureSchema>>();

	const abilityScoreValues = form.watch("ability_scores");
	const abilityScores = abilityScoresSchema.keyof()._def.values;

	return (
		<div className="grid grid-cols-6 gap-3">
			{abilityScores.map((ability) => (
				<FormField
					key={ability}
					control={form.control}
					name={`ability_scores.${ability}`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{ability.toUpperCase().slice(0, 3)}{" "}
								<span className="text-muted-foreground">
									{abilityScoreValues &&
										calculateStatBonus(abilityScoreValues[ability])}
								</span>
							</FormLabel>
							<FormControl>
								<Input placeholder="10" type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	);
}

export default AbilityScoresForm;
