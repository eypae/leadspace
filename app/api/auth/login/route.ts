import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// POST /api/auth/login
// Body: { email: string, password: string }
//
// Signs the user in via Supabase Auth and returns the session tokens.
// @supabase/ssr automatically sets the HttpOnly session cookie.

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.session) {
    // Use a generic message — don't reveal whether email or password was wrong
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  // Return tokens so the browser Zustand store can sync the session client-side
  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  });
}
