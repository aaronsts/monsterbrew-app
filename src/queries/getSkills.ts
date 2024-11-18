import useSupabaseBrowser from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = "creature-skills";

export function useGetSkills() {
	const supabase = useSupabaseBrowser();
	return useQuery({
		queryKey: [QUERY_KEY],
		queryFn: async () => {
			return supabase.from("skills").select("*");
		},
	});
}
