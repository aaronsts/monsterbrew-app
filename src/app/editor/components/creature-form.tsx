"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	createCreatureSchema,
	defaultCreature,
} from "@/schema/createCreatureSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetCreatureTypes } from "@/queries/getCreatureTypes";
import { useGetCreatureSizes } from "@/queries/getCreatureSizes";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useGetChallengeRatings } from "@/queries/getChallengeRatings";
import { Tables } from "@/types/database.types";
import MovementForm from "./movements-form";
import AbilityScoresForm from "./ability-scores-form";
import SensesForm from "./senses-form";
import SavingThrowsForm from "./saving-throws-form";
import LanguagesForm from "./form/languages-form";
import SkillBonusForm from "./form/skill-bonus-form";

type ChallengeRatingType = Tables<"challenge_ratings">;

function CreatureForm() {
	const [customHP, setCustomHP] = useState(false);
	const [selectedCR, setSelectedCR] = useState<ChallengeRatingType>();

	const form = useForm<z.infer<typeof createCreatureSchema>>({
		resolver: zodResolver(createCreatureSchema),
		defaultValues: defaultCreature,
	});

	const { data: types } = useGetCreatureTypes();
	const { data: sizes } = useGetCreatureSizes();
	const { data: challengeRatings } = useGetChallengeRatings();

	const challengeRatingId = form.watch("challenge_rating_id");

	useEffect(() => {
		if (!challengeRatingId || !challengeRatings?.data) return;
		setSelectedCR(
			challengeRatings?.data?.find(
				(cr) => cr.id.toString() === challengeRatingId
			)
		);
	}, [challengeRatingId, challengeRatings?.data]);

	const onSubmit = (values: z.infer<typeof createCreatureSchema>) => {
		console.log(values);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle>Create creature</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
						<div className="grid grid-cols-3  gap-3">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="col-span-2">
										<FormLabel>Creature Name</FormLabel>
										<FormControl>
											<Input placeholder="Ancient Red Dragon" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Creature Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{types?.data?.map((type) => (
													<SelectItem key={type.id} value={type.id.toString()}>
														{type.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Creature Size</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl className="capitalize">
												<SelectTrigger>
													<SelectValue placeholder="Select a size" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{sizes?.data?.map((size) => (
													<SelectItem
														key={size.id}
														className="capitalize"
														value={size.id.toString()}
													>
														{size.name} -{" "}
														<span className="text-muted-foreground">
															D{size.hit_dice}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="alignment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Alignment</FormLabel>
										<FormControl>
											<Input placeholder="ex. Chaotic Evil" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="armor_class"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Armor Class (AC)</FormLabel>
										<FormControl>
											<Input placeholder="ex. 21" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="armor_class"
								render={({ field }) => (
									<FormItem>
										<FormLabel>AC Description</FormLabel>
										<FormControl>
											<Input placeholder="ex. Natural Armor" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="hit_dice"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex gap-2 items-center">
											<TooltipProvider delayDuration={300}>
												Hit Dice{" "}
												<Tooltip>
													<TooltipTrigger asChild>
														<Info className="w-4 text-cararra-700" />
													</TooltipTrigger>
													<TooltipContent>
														<p>
															Hit Dice is based <br /> on a creatures&apos;{" "}
															<br /> Size and Constitution
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</FormLabel>
										<FormControl>
											<Input placeholder="ex. 21" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="space-y-0.5">
								<span className="h-10 block"></span>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="customHp"
										onCheckedChange={(e: boolean) => setCustomHP(e)}
									/>
									<Label
										htmlFor="customHp"
										className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Custom HP
									</Label>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<FormField
								control={form.control}
								name="challenge_rating_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Challenge Rating</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl className="relative">
												<SelectTrigger>
													<SelectValue placeholder="Select a rating" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{challengeRatings?.data?.map((rating) => (
													<SelectItem
														key={rating.id}
														value={rating.id.toString()}
														className=" justify-between"
													>
														{rating.challenge_rating}
														<span className="absolute right-8 text-primary">
															{new Intl.NumberFormat().format(
																rating.experience
															)}{" "}
															XP
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="space-y-0.5">
								<span className="h-9 block"></span>
								<p>
									Proficiency Bonus:{" "}
									{selectedCR ? `+${selectedCR?.proficiency_bonus}` : 0}
								</p>
							</div>
						</div>
						<MovementForm />
						<AbilityScoresForm />
						<SensesForm />
						<LanguagesForm />
						<SavingThrowsForm />
						<SkillBonusForm />
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default CreatureForm;
