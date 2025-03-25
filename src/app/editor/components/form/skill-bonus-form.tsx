import { Badge } from "@/components/ui/badge";
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
import { X } from "lucide-react";
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

  const fieldArray = useFieldArray({
    control: form.control,
    name: "skill_bonuses",
  });

  const { data } = useGetSkills();

  const skills =
    data?.data &&
    Object.groupBy(data.data, ({ skill_modifier }) => skill_modifier);

  const handleSelectChange = (value: string) => {
    if (!data?.data) return;
    const skill = data.data.find((skl) => skl.id.toString() === value);
    if (!skill) return;
    setSelectedSkill({
      ...skill,
      skill_modifier: skill.skill_modifier,
    });
  };

  function addSkill(event: React.MouseEvent<HTMLElement>) {
    if (!selectedSkill) return;
    const skillIndexExists = fieldArray.fields.findIndex(
      (skill) => skill.skill_name === selectedSkill.skill_name
    );

    if (skillIndexExists !== -1) {
      if (event.currentTarget.dataset.expert === "true") {
        fieldArray.update(skillIndexExists, {
          ...selectedSkill,
          is_expert: true,
        });
      } else {
        fieldArray.update(skillIndexExists, {
          ...selectedSkill,
          is_proficient: true,
        });
      }
    } else {
      if (event.currentTarget.dataset.expert === "true") {
        fieldArray.append({ ...selectedSkill, is_expert: true });
      } else {
        fieldArray.append({ ...selectedSkill, is_proficient: true });
      }
    }
  }

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
                    <SelectLabel className="uppercase">{modifier}</SelectLabel>
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
          onClick={addSkill}
          className="mt-8"
          data-expert="false"
          variant="proficient"
        >
          Proficient
        </Button>
        <Button
          type="button"
          variant="expert"
          onClick={addSkill}
          className="mt-8"
          data-expert="true"
        >
          Expertise
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 py-3">
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
