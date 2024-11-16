import { loginSchema } from "@/components/login-form";
import useSupabaseBrowser from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { z } from "zod";

export function useSignUp() {
	const supabase = useSupabaseBrowser();
	return useMutation({
		mutationFn: async (data: z.infer<typeof loginSchema>) => {
			const res = await supabase.auth.signUp(data);
			if (res.error) {
				toast.error(res.error.message, {
					position: "top-center",
				});
			} else {
				redirect("/editor");
			}
		},
	});
}
