import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-server";

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/webhook", // WhatsApp webhook must be publicly accessible
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through without any auth check
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Create a mutable response so Supabase can refresh the session cookie
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  // Validate and refresh the session token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No valid session → redirect to login, preserving the intended destination
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Valid session → pass through with refreshed cookie headers
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static  (Next.js build assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public files  (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
