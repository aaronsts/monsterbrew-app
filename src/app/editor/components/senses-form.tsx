import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectBox from "@/components/ui/multi-select";
import { titleCase } from "@/lib/utils";
import {
	createCreatureSchema,
	sensesSchema,
} from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function SensesForm() {
	const form = useFormContext<z.infer<typeof createCreatureSchema>>();

	const senses = sensesSchema
		.keyof()
		._def.values.filter((sense) => sense !== "is_blind_beyond");

	return (
		<div className="grid grid-cols-4 gap-3">
			{senses.map((sense) => (
				<FormField
					key={sense}
					control={form.control}
					name={`senses.${sense}`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{titleCase(sense)}</FormLabel>
							<FormControl>
								<Input placeholder="10" type="number" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
			<FormField
				control={form.control}
				name="senses.is_blind_beyond"
				render={({ field }) => (
					<FormItem className="flex gap-2 space-y-0 items-center">
						<FormControl>
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
						</FormControl>
						<FormLabel className="text-xs leading-none">
							Blind beyond this radius
						</FormLabel>
					</FormItem>
				)}
			/>
		</div>
	);
}

export default SensesForm;
