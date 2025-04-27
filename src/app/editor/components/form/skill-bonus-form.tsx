import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { SkillModifier, SKILLS } from "@/lib/skills";
import { titleCase } from "@/lib/utils";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";

function SkillBonusForm() {
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>();

  const form = useFormContext<z.infer<typeof createCreatureSchema>>();

  const fieldArray = useFieldArray({
    control: form.control,
    name: "skill_bonuses",
  });

  const skills = Object.groupBy(
    SKILLS,
    ({ skill_modifier }) => skill_modifier
  ) as Record<SkillModifier, (typeof SKILLS)[number][]>;

  const skillsForMultiSelect = Object.entries(skills).reduce(
    (acc, [modifier, skillsArray]) => {
      acc[modifier] = skillsArray.map((skill) => ({
        label: titleCase(skill.skill_name),
        value: skill.skill_name.toLowerCase(),
      }));
      return acc;
    },
    {} as Record<string, { label: string; value: string }[]>
  );

  function addSkill(event: React.MouseEvent<HTMLElement>) {
    if (!selectedSkills || selectedSkills.size === 0) return;

    const isExpert = event.currentTarget.dataset.expert === "true";

    Array.from(selectedSkills).forEach((skillName) => {
      const skillData = SKILLS.find(
        (s) => s.skill_name.toLowerCase() === skillName
      );

      if (!skillData) return;

      const skillToAdd = {
        skill_name: skillData.skill_name,
        skill_modifier: skillData.skill_modifier,
        is_expert: isExpert,
        is_proficient: !isExpert,
      };

      const skillIndex = fieldArray.fields.findIndex(
        (skill) => skill.skill_name.toLowerCase() === skillName
      );

      if (skillIndex !== -1) {
        fieldArray.update(skillIndex, skillToAdd);
      } else {
        fieldArray.append(skillToAdd);
      }
    });

    setSelectedSkills(new Set());
  }

  return (
    <div className="grid gap-3">
      <div className="flex  gap-3 items-end">
        <div className="grid gap-2 flex-1 ">
          <Label>Skill Saves</Label>
          <MultiSelect
            title="Select skill"
            groupedOptions={skillsForMultiSelect}
            selectedValues={new Set(selectedSkills)}
            onSelectionChange={(selectedValues) => {
              setSelectedSkills(selectedValues);
              console.log(selectedValues);
            }}
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={addSkill}
            data-expert="false"
            variant="light"
            color="stromboli"
          >
            Proficient
          </Button>
          <Button
            type="button"
            variant="light"
            color="calypso"
            onClick={addSkill}
            data-expert="true"
          >
            Expertise
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {fieldArray.fields.map((bonus, i) => (
          <Badge
            className="relative pr-6"
            variant={bonus.is_proficient ? "proficient" : "expert"}
            key={bonus.skill_name + i}
          >
            {bonus.skill_name}
            <span
              className="absolute right-1.5 top-1 hover:cursor-pointer"
              data-skill={bonus.skill_name}
              onClick={() => fieldArray.remove(i)}
            >
              <X className="w-3 h-3" />
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default SkillBonusForm;
