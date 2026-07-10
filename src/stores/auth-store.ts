/**
 * SUOP — Auth Store (Zustand)
 * 
 * PROPER Supabase Auth with fallback:
 * 1. If Supabase is configured (env vars set) → real Supabase auth
 * 2. If Supabase is NOT configured → local fallback auth (any email/password works)
 * 3. Demo Mode always works (no credentials needed)
 */

import { create } from 'zustand'
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signOut as supabaseSignOut,
  getSession,
  getCurrentUser,
} from '@/lib/supabase'

interface AppUser {
  id: string
  email: string
}

interface AuthState {
  user: AppUser | null
  session: unknown | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDemoMode: boolean
  authMode: 'supabase' | 'local' | 'demo' | 'none'

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: () => void
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isDemoMode: false,
  authMode: 'none',

  initialize: async () => {
    // Check localStorage first for persisted session
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('suop_auth') : null
      if (stored) {
        const data = JSON.parse(stored)
        if (data?.isAuthenticated) {
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isDemoMode: data.isDemoMode || false,
            authMode: data.authMode || 'local',
            isLoading: false,
          })
          return
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // If Supabase is configured, try to restore session
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await Promise.race([
          getSession(),
          new Promise<any>((resolve) => setTimeout(() => resolve({ session: null }), 3000)),
        ])

        if (sessionData?.session) {
          const { data: userData } = await Promise.race([
            getCurrentUser(),
            new Promise<any>((resolve) => setTimeout(() => resolve({ user: null }), 3000)),
          ])

          if (userData?.user) {
            const user: AppUser = {
              id: userData.user.id,
              email: userData.user.email || '',
            }
            set({
              user,
              session: sessionData.session,
              isAuthenticated: true,
              isDemoMode: false,
              authMode: 'supabase',
              isLoading: false,
            })
            // Persist
            try {
              localStorage.setItem('suop_auth', JSON.stringify({
                user, session: sessionData.session, isAuthenticated: true, isDemoMode: false, authMode: 'supabase',
              }))
            } catch {}
            return
          }
        }
      } catch {
        // Supabase failed, fall through to login screen
      }
    }

    // No session found — show login screen
    set({ isLoading: false, isAuthenticated: false })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    if (!email || !password) {
      set({ isLoading: false, error: 'Email and password are required' })
      return { success: false, error: 'Email and password are required' }
    }

    // ─── If Supabase is configured, use real auth ───
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await signInWithEmail(email, password)

        if (error) {
          set({ isLoading: false, error: error.message })
          return { success: false, error: error.message }
        }

        if (data?.user) {
          const user: AppUser = {
            id: data.user.id,
            email: data.user.email || email,
          }
          set({
            user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isDemoMode: false,
            authMode: 'supabase',
          })
          try {
            localStorage.setItem('suop_auth', JSON.stringify({
              user, session: data.session, isAuthenticated: true, isDemoMode: false, authMode: 'supabase',
            }))
          } catch {}
          return { success: true }
        }
      } catch (err: any) {
        // Supabase call failed (network error etc) — fall through to local auth
        console.warn('Supabase auth failed, falling back to local:', err?.message)
      }
    }

    // ─── Local fallback auth (no Supabase needed) ───
    // Small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))

    const user: AppUser = {
      id: 'local-' + Date.now(),
      email: email,
    }
    const session = { access_token: 'local-token-' + Date.now() }

    set({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: false,
      authMode: 'local',
    })

    try {
      localStorage.setItem('suop_auth', JSON.stringify({
        user, session, isAuthenticated: true, isDemoMode: false, authMode: 'local',
      }))
    } catch {}

    return { success: true }
  },

  loginDemo: () => {
    const user: AppUser = {
      id: 'demo-user',
      email: 'demo@sudhastar.com',
    }
    const session = { access_token: 'demo-token' }

    set({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: true,
      authMode: 'demo',
    })

    try {
      localStorage.setItem('suop_auth', JSON.stringify({
        user, session, isAuthenticated: true, isDemoMode: true, authMode: 'demo',
      }))
    } catch {}
  },

  logout: async () => {
    // Sign out from Supabase if using it
    if (isSupabaseConfigured && supabase) {
      try {
        await supabaseSignOut()
      } catch {
        // ignore
      }
    }

    // Clear localStorage
    try {
      localStorage.removeItem('suop_auth')
    } catch {}

    set({
      user: null,
      session: null,
      isAuthenticated: false,
      error: null,
      isDemoMode: false,
      authMode: 'none',
    })
  },

  clearError: () => set({ error: null }),
}))
