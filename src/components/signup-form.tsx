"use client";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { PasswordInput } from "./ui/password-input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingSpinner } from "./ui/loading-spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const signUpSchema = z.object({
	email: z.string(),
	password: z.string(),
	// .min(8, { message: "Password must contain atleast 8 characters" }),
});

export function SignUpForm() {
	const router = useRouter();

	const validatationRegEx = useMemo(() => {
		return {
			lowercase: /(?=(.*[a-z]){2,})/,
			uppercase: /(?=(.*[A-Z]){1,})/,
			numbers: /(?=(.*[0-9]){1,})/,
			specialChar: /(?=(.*[!@#$%^&*()\-__+.]){1,})/,
		};
	}, []);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const password = form.watch("password");
	const hasSpecialChar = validatationRegEx.specialChar.test(password);
	const hasCapitalLetter = validatationRegEx.uppercase.test(password);
	const hasNumber = validatationRegEx.numbers.test(password);
	const validateLength = password.length >= 8;

	const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
		router.push("/signup/email-confirm");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign Up</CardTitle>
				<CardDescription>
					Enter your details below to create to your account
				</CardDescription>
			</CardHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="p-6 pt-0">
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="monster@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<PasswordInput
												placeholder="Minimum 6 characters"
												{...field}
												autoComplete="password"
											/>
										</FormControl>
										<ul className="text-sm text-muted-foreground">
											<li
												className={cn(
													"flex gap-1",
													hasSpecialChar && "text-foreground"
												)}
											>
												{hasSpecialChar ? (
													<Check className="w-4 text-success" />
												) : (
													<X className="w-4 text-destructive" />
												)}
												<span>contains a special character</span>
											</li>
											<li
												className={cn(
													"flex gap-1 ",
													hasCapitalLetter && "text-foreground"
												)}
											>
												{hasCapitalLetter ? (
													<Check className="w-4 text-success" />
												) : (
													<X className="w-4 text-destructive" />
												)}
												<span>contains a capital character</span>
											</li>
											<li
												className={cn(
													"flex gap-1 ",
													hasNumber && "text-foreground"
												)}
											>
												{hasNumber ? (
													<Check className="w-4 text-success" />
												) : (
													<X className="w-4 text-destructive" />
												)}
												<span>contains a number</span>
											</li>
											<li
												className={cn(
													"flex gap-1 ",
													validateLength && "text-foreground"
												)}
											>
												{validateLength ? (
													<Check className="w-4 text-success" />
												) : (
													<X className="w-4 text-destructive" />
												)}

												<span>atleast 8 characters</span>
											</li>
										</ul>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full">
								{form.formState.isSubmitting && <LoadingSpinner />}
								Sign up
							</Button>
						</div>
						<div className="mt-4 text-center text-sm">
							Already have an account?{" "}
							<Link href="/login" className="underline">
								Login
							</Link>
						</div>
					</CardContent>
				</form>
			</Form>
		</Card>
	);
}
