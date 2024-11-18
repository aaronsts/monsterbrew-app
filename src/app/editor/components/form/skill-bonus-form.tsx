import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import SelectBox from "@/components/ui/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetSkills } from "@/queries/getSkills";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function SkillBonusForm() {
	const form = useFormContext<z.infer<typeof createCreatureSchema>>();

	const { data: skills } = useGetSkills();

	return (
		<FormField
			control={form.control}
			name="skill_bonuses"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Creature Type</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select a type" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{skills?.data?.map((skill) => (
								<SelectItem key={skill.id} value={skill.id.toString()}>
									{skill.skill_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export default SkillBonusForm;
