import { signUpSchema } from "@/components/signup-form";
import createClient from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function signup(data: z.infer<typeof signUpSchema>) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signUp(data);

	if (error) {
		return {
			error: { code: error.code, name: error.name, message: error.message },
		};
	}

	revalidatePath("/", "layout");
	redirect("/");
}
