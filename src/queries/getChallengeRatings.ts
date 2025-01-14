import useSupabaseBrowser from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = "challenge-ratings";

export function useGetChallengeRatings() {
	const supabase = useSupabaseBrowser();
	return useQuery({
		queryKey: [QUERY_KEY],
		queryFn: async () => {
			return supabase.from("challenge_ratings").select("*");
		},
	});
}
