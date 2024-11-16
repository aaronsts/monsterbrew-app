"use server";

import { loginSchema } from "@/components/login-form";
import createClient from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function login(data: z.infer<typeof loginSchema>) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		return {
			error: { code: error.code, name: error.name, message: error.message },
		};
	}

	revalidatePath("/", "layout");
	redirect("/");
}
