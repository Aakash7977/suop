/**
 * SUOP — Auth Store (Zustand)
 * Sprint 3: Epic 10 — Frontend Authentication
 * 
 * FIXED: Works without Supabase configuration. Demo Mode is primary.
 * Login with any email/password also works in fallback mode.
 */

import { create } from 'zustand'

interface DemoUser {
  id: string
  email: string
}

interface AuthState {
  user: DemoUser | null
  session: unknown | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDemoMode: boolean

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

  initialize: async () => {
    // Check if we have a stored demo session
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
            isLoading: false,
          })
          return
        }
      }
    } catch {
      // ignore localStorage errors
    }
    // No stored session — show login screen immediately
    set({ isLoading: false, isAuthenticated: false })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!email || !password) {
      set({ isLoading: false, error: 'Email and password are required' })
      return { success: false, error: 'Email and password are required' }
    }

    // Fallback login: accept any email/password (for local development)
    // In production, replace this with real Supabase auth
    const user: DemoUser = {
      id: 'user-' + Date.now(),
      email: email,
    }
    
    const session = { access_token: 'token-' + Date.now() }
    
    set({
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isDemoMode: false,
    })

    // Persist to localStorage
    try {
      localStorage.setItem('suop_auth', JSON.stringify({
        user, session, isAuthenticated: true, isDemoMode: false
      }))
    } catch {
      // ignore
    }

    return { success: true }
  },

  loginDemo: () => {
    const user: DemoUser = {
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
    })

    // Persist to localStorage
    try {
      localStorage.setItem('suop_auth', JSON.stringify({
        user, session, isAuthenticated: true, isDemoMode: true
      }))
    } catch {
      // ignore
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('suop_auth')
    } catch {
      // ignore
    }
    set({ user: null, session: null, isAuthenticated: false, error: null, isDemoMode: false })
  },

  clearError: () => set({ error: null }),
}))
