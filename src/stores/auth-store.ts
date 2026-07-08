/**
 * SUOP — Auth Store (Zustand)
 * Sprint 3: Epic 10 — Frontend Authentication
 *
 * Manages client-side authentication state.
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

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    try {
      const { session } = await getSession()
      if (session) {
        const { user } = await getCurrentUser()
        set({
          user,
          session,
          isAuthenticated: !!user,
          isLoading: false,
        })
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

  logout: async () => {
    await supabaseSignOut()
    set({ user: null, session: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))
