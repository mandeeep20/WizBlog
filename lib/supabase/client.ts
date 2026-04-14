import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseCredentials } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(credentials.url, credentials.anonKey);
}