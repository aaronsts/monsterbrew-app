import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetSkills } from "@/queries/getSkills";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

type SkillBonusType = {
	is_expert?: boolean;
	is_proficient?: boolean;
	skill_modifier: string;
	skill_name: string;
};

function SkillBonusForm() {
	const [selectedSkill, setSelectedSkill] = useState<SkillBonusType>();

	const form = useFormContext<z.infer<typeof createCreatureSchema>>();
	const fieldArray = useFieldArray<z.infer<typeof createCreatureSchema>>({
		name: "skill_bonuses",
	});

	const { data } = useGetSkills();

	const skills =
		data?.data &&
		Object.groupBy(data.data, ({ skill_modifier }) => skill_modifier);

	const handleSelectChange = (value) => {
		if (!data?.data) return;
		const skill = data.data.find((skl) => skl.id.toString() === value);
		if (!skill) return;
		setSelectedSkill({ ...skill });
	};

	function addSkill(event: React.MouseEvent<HTMLElement>) {
		if (event.currentTarget.dataset.expert === "true") {
			fieldArray.append({ ...selectedSkill, is_expert: true });
		} else {
			fieldArray.append({ ...selectedSkill, is_proficient: true });
		}
	}

	const skillBonuses = form.getValues("skill_bonuses");

	return (
		<div>
			<div className="grid grid-cols-4 gap-3">
				<div className="space-y-2 col-span-2">
					<Label>Skill Bonuses</Label>
					<Select onValueChange={handleSelectChange}>
						<SelectTrigger className="relative capitalize">
							<SelectValue placeholder="Select a skill" />
						</SelectTrigger>
						<SelectContent>
							{skills &&
								Object.keys(skills).map((modifier) => (
									<SelectGroup key={modifier}>
										<SelectLabel>{modifier}</SelectLabel>
										{skills[modifier] &&
											skills[modifier].map((skill) => (
												<SelectItem
													key={skill.id}
													value={skill.id.toString()}
													className="relative capitalize"
												>
													{skill.skill_name}
												</SelectItem>
											))}
									</SelectGroup>
								))}
						</SelectContent>
					</Select>
				</div>
				<Button
					type="button"
					variant="tertiary"
					onClick={addSkill}
					className="mt-8"
					data-expert="false"
				>
					Proficient
				</Button>
				<Button
					type="button"
					variant="secondary"
					onClick={addSkill}
					className="mt-8"
					data-expert="true"
				>
					Exprtise
				</Button>
			</div>
			{skillBonuses.map((bonus) => (
				<>{bonus.skill_name}</>
			))}
		</div>
	);
}

export default SkillBonusForm;
