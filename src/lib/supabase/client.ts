import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

let client: TypedSupabaseClient | undefined;

function getSupabaseBrowserClient() {
	if (client) {
		return client;
	}

	client = createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);

	return client;
}

function useSupabaseBrowser() {
	return useMemo(getSupabaseBrowserClient, []);
}

export default useSupabaseBrowser;
