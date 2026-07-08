/**
 * SUOP — Auth Store (Zustand)
 * Sprint 3: Epic 10 — Frontend Authentication
 *
 * Manages client-side authentication state.
 * Includes timeout safeguard + demo mode so the UI loads even if Supabase
 * is unreachable from the preview environment.
 */

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import {
  supabase,
  signInWithEmail,
  signOut as supabaseSignOut,
  getSession,
  getCurrentUser,
} from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: unknown | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDemoMode: boolean

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: () => void
  logout: () => Promise<void>
  clearError: () => void
}

// Helper: race a promise against a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  isDemoMode: false,

  initialize: async () => {
    try {
      // Timeout safeguard: if Supabase doesn't respond in 3 seconds, proceed to login screen
      const { session } = await withTimeout(getSession(), 3000, { session: null, error: null })
      if (session) {
        try {
          const { user } = await withTimeout(getCurrentUser(), 3000, { user: null, error: null })
          set({
            user,
            session,
            isAuthenticated: !!user,
            isLoading: false,
          })
        } catch {
          set({ user: null, session: null, isAuthenticated: false, isLoading: false })
        }
      } else {
        set({ user: null, session: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, session: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await signInWithEmail(email, password)

      if (error) {
        set({ isLoading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.user,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ isLoading: false, error: message })
      return { success: false, error: message }
    }
  },

  loginDemo: () => {
    // Demo mode: bypass Supabase auth entirely — lets you explore the full UI
    set({
      user: { id: 'demo-user', email: 'demo@sudhastar.com' } as unknown as User,
      session: { access_token: 'demo-token' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: true,
    })
  },

  logout: async () => {
    try {
      await supabaseSignOut()
    } catch {
      // ignore — demo mode doesn't need real signout
    }
    set({ user: null, session: null, isAuthenticated: false, error: null, isDemoMode: false })
  },

  clearError: () => set({ error: null }),
}))
