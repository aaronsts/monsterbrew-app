import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function EmailConfirmPage() {
	return (
		<div className="flex h-screen w-full items-center justify-center px-4">
			<Card>
				<CardHeader className="items-center">
					<CardDescription className="text-foreground text-xl">
						Welcome to Monsterbrew!
					</CardDescription>
					<CardTitle className="text-3xl">
						Please validate your email address!
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p>
						An email has been sent with a link to verify your email address.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
