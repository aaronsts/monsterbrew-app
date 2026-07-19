We are rebuilding our creature form from the ground up, dividing field into logical section.
The 4 main sections are Identity, Combat, Defense and Actions. Identity and Combat have already been finished.

This is the requirements for the Defense section.

### Requirements

Create a component `defense-form.tsx`.

The defense form has the following field:

- saving throws
- skill (skill saves)
- damage modifiers (resistances, immunities and vulnerabilities)
- confition immunities

Now we go in depth on how each of these fields should behave:

### Saving Throws

The schema for saving throws should look like this:

```
export const SavingThrowsSchema = z.object({
	str: z.number().optional(),
	dex: z.number().optional(),
	con: z.number().optional(),
	int: z.number().optional(),
	wis: z.number().optional(),
	cha: z.number().optional(),
});
```

It mirrors the layout of ability modifiers but with toggles.

## Skill saves

The skills schema looks like `skills: z.record(z.string(), z.number()).optional(),`

They are double toggled buttons (three states: off, proficient and expert), default state is of, 1 click shows proficient, 2 click shows expert.
The skills are grouped by ability modifier.

example component:

```
<FieldGroup>
											<FieldLabel className="-mb-3">Skills</FieldLabel>
											<div className="grid grid-cols-5 gap-3">
												{SKILLS_BY_ABILITY.map(({ ability, label, skills }) => (
													<div key={ability} className="space-y-px">
														<p className="pt-1.5 pb-0.5 font-medium text-[10px] uppercase tracking-wider">
															{label}
														</p>
														{skills.map(({ skill_name }) => {
															const prof = skillValues[skill_name] || "";
															const baseMod = abilityModifier(
																scores[ability as AbilityKey],
															);
															const totalMod =
																prof === "expert"
																	? baseMod + 2 * profBonus
																	: prof === "proficient"
																		? baseMod + profBonus
																		: baseMod;
															return (
																<FieldLabel
																	key={skill_name}
																	className="cursor-pointer rounded px-2 py-1 hover:bg-muted"
																	onClick={(e: React.MouseEvent) => {
																		e.preventDefault();
																		const next: SkillProficiency =
																			prof === ""
																				? "proficient"
																				: prof === "proficient"
																					? "expert"
																					: "";
																		skillsField.handleChange({
																			...skillValues,
																			[skill_name]: next,
																		});
																	}}
																>
																	<Field orientation="horizontal">
																		<span className="flex gap-0.5">
																			<Checkbox
																				checked={
																					prof === "proficient" ||
																					prof === "expert"
																				}
																				onClick={(e: React.MouseEvent) => {
																					e.preventDefault();
																					e.stopPropagation();
																				}}
																			/>
																			<Checkbox
																				checked={prof === "expert"}
																				onClick={(e: React.MouseEvent) => {
																					e.preventDefault();
																					e.stopPropagation();
																				}}
																			/>
																		</span>
																		<FieldContent className="flex-row items-center">
																			<FieldTitle
																				className={`flex-1 capitalize ${prof !== "" ? "text-foreground" : "text-muted-foreground"}`}
																			>
																				{skill_name}
																			</FieldTitle>
																			<FieldDescription
																				className={`text-[11px] tabular-nums ${prof !== "" ? "text-foreground" : "text-muted-foreground"}`}
																			>
																				{formatModifier(totalMod)}
																			</FieldDescription>
																		</FieldContent>
																	</Field>
																</FieldLabel>
															);
														})}
													</div>
												))}
											</div>
										</FieldGroup>
                                        export function formatModifier(mod: number): string {
	return mod >= 0 ? `+${mod}` : `${mod}`;
}
```

## Damage modifiers

Displays a list of damage modifier buttons / toggles that cycles through the state (off, resistant, vulnerable, immune).

```
<FieldGroup>
							<span className="inline-flex items-center gap-1.5">
								<FieldLabel>Damage Modifiers</FieldLabel>
								<Tooltip>
									<TooltipTrigger className="text-muted-foreground hover:text-foreground">
										<Info className="size-3" />
									</TooltipTrigger>
									<TooltipContent
										side="top"
										className="flex max-w-xs flex-col items-start space-y-1 p-3 text-left"
									>
										<p className="font-bold">
											Click a damage type to cycle its state:
										</p>
										<ul className="space-y-0.5">
											<li>
												<span className="font-semibold text-red-400">Red</span>{" "}
												— Vulnerable (double damage)
											</li>
											<li>
												<span className="font-semibold text-amber-400">
													Amber
												</span>{" "}
												— Resistant (half damage)
											</li>
											<li>
												<span className="font-semibold text-green-500">
													Green
												</span>{" "}
												— Immune (no damage)
											</li>
										</ul>
									</TooltipContent>
								</Tooltip>
							</span>
							<div className="flex flex-wrap gap-1">
								{DAMAGE_TYPES.map((type) => {
									const state = states[type] || "";
									return (
										<button
											key={type}
											type="button"
											className={cn(
												"inline-flex items-center gap-1 px-3 py-1 font-medium text-xs capitalize transition-colors",
												damageStateStyles(state),
											)}
											onClick={() => {
												field.handleChange({
													...states,
													[type]: nextDamageState(state),
												});
											}}
										>
											{type}
										</button>
									);
								})}
							</div>
						</FieldGroup>
```

## Condition Immunities

Displays a list of toggle button for all immunitie conditions.
