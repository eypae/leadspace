"use client";

import { createBrowserClient } from "@supabase/ssr";

// Used in client components and Zustand store.
// Creates a singleton browser client that reads/writes cookies automatically.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Singleton instance for use throughout the app
let client: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) client = createSupabaseBrowserClient();
  return client;
}
