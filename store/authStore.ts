import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface Agent {
  id: string
  display_name: string
  role: 'agent' | 'admin'
  created_at: string
}

interface AuthState {
  session:     Session | null
  user:        User | null
  profile:     Agent | null
  loading:     boolean
  initialized: boolean

  initialize: () => Promise<void>
  signIn:     (email: string, password: string) => Promise<{ error: string | null }>
  signOut:    () => Promise<void>
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      session:     null,
      user:        null,
      profile:     null,
      loading:     false,
      initialized: false,

      // Called once on app mount via AuthProvider
      initialize: async () => {
        if (get().initialized) return
        set({ loading: true })

        const supabase = getSupabaseBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          set({ session, user: session.user, profile, loading: false, initialized: true })
        } else {
          set({ session: null, user: null, profile: null, loading: false, initialized: true })
        }

        // onAuthStateChange handles all session transitions including
        // the SIGNED_IN event fired after signInWithPassword below
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id)
            // Set session in store — this triggers useEffect in login page
            set({ session, user: session.user, profile, loading: false })
          } else {
            set({ session: null, user: null, profile: null, loading: false })
          }
        })
      },

      signIn: async (email, password) => {
        set({ loading: true })

        try {
          // Sign in directly on the browser client instead of going through
          // the API route + setSession. This avoids the setSession deadlock
          // where it hangs waiting for onAuthStateChange to settle.
          // The SIGNED_IN event fires on onAuthStateChange above, which sets
          // the session in the store and triggers the redirect in login/page.tsx
          const supabase = getSupabaseBrowserClient()
          const { error } = await supabase.auth.signInWithPassword({ email, password })

          if (error) {
            set({ loading: false })
            return { error: 'Invalid email or password' }
          }

          // Don't set loading: false here — keep the spinner running until
          // onAuthStateChange fires, sets the session, and the login page
          // redirects via window.location.href
          return { error: null }
        } catch {
          set({ loading: false })
          return { error: 'Something went wrong. Please try again.' }
        }
      },

      signOut: async () => {
        set({ loading: true })
        const supabase = getSupabaseBrowserClient()
        await supabase.auth.signOut()
        set({ session: null, user: null, profile: null, loading: false })
        window.location.href = '/login'
      },

      setSession: (session) => {
        set({ session, user: session?.user ?? null })
      },
    }),
    { name: 'auth-store' }
  )
)

async function fetchProfile(userId: string): Promise<Agent | null> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase
    .from('agents')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data ?? null
}