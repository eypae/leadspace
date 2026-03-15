"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Wraps the entire app in app/layout.tsx.
// Initializes the Zustand auth store once on mount by:
//   1. Reading the current session from the Supabase cookie
//   2. Fetching the agent profile
//   3. Setting up the onAuthStateChange listener for token refreshes

export default function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Render children immediately — the login page handles its own
  // loading state, and the middleware already blocks unauthenticated
  // access to protected routes before the page renders.
  return <>{children}</>;
}
