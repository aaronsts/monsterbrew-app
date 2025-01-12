import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

function MovementForm() {
	const form = useFormContext<z.infer<typeof createCreatureSchema>>();
	return (
		<div className="grid grid-cols-5 gap-3">
			<FormField
				control={form.control}
				name="movements.walk"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Walking</FormLabel>
						<FormControl>
							<div className="relative w-full">
								<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 z-10">
									ft.
								</span>
								<Input type="number" placeholder="ex. 0" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="movements.swim"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Swimming</FormLabel>
						<FormControl>
							<div className="relative w-full">
								<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 z-10">
									ft.
								</span>
								<Input type="number" placeholder="ex. 0" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="movements.burrow"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Burrowing</FormLabel>
						<FormControl>
							<div className="relative w-full">
								<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 z-10">
									ft.
								</span>
								<Input type="number" placeholder="ex. 0" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="movements.climb"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Climbing</FormLabel>
						<FormControl>
							<div className="relative w-full">
								<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 z-10">
									ft.
								</span>
								<Input type="number" placeholder="ex. 0" {...field} />
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className="space-y-2">
				<FormField
					control={form.control}
					name="movements.fly"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Flying</FormLabel>
							<FormControl>
								<div className="relative w-full">
									<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 z-10">
										ft.
									</span>
									<Input type="number" placeholder="ex. 0" {...field} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="movements.hover"
					render={({ field }) => (
						<FormItem className="flex gap-2 space-y-0 items-center">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel className="text-xs leading-none">Hover</FormLabel>
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}

export default MovementForm;
