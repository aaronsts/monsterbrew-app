"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
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

function CreatureForm() {
	const form = useForm<z.infer<typeof createCreatureSchema>>({
		resolver: zodResolver(createCreatureSchema),
	});

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
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Monster Name</FormLabel>
										<FormControl>
											<Input placeholder="Ancient Red Dragon" {...field} />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Monster Name</FormLabel>
										<FormControl>
											<Input placeholder="Ancient Red Dragon" {...field} />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default CreatureForm;
