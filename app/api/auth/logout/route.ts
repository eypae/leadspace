import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// POST /api/auth/logout
// Signs the user out server-side and clears the session cookie.

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
