/**
 * SUOP — Supabase Client
 * Properly handles both configured and unconfigured states.
 * - If NEXT_PUBLIC_SUPABASE_URL is set: uses real Supabase
 * - If not set: exports null, auth falls back to local mode
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if BOTH env vars are present and not placeholder
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseUrl.startsWith('http')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'MICROSOFT' | 'LDAP' | 'SAML' | 'GITHUB'

export const AUTH_PROVIDERS: Record<AuthProvider, { label: string; icon: string; enabled: boolean }> = {
  LOCAL: { label: 'Email & Password', icon: 'mail', enabled: true },
  GOOGLE: { label: 'Google Workspace', icon: 'google', enabled: false },
  MICROSOFT: { label: 'Microsoft Entra ID', icon: 'microsoft', enabled: false },
  LDAP: { label: 'LDAP', icon: 'ldap', enabled: false },
  SAML: { label: 'SAML SSO', icon: 'saml', enabled: false },
  GITHUB: { label: 'GitHub', icon: 'github', enabled: false },
}

// ─── Auth Helper Functions ──────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } as any }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured' } as any }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  return { data, error }
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut()
  }
}

export async function getSession() {
  if (!supabase) return { session: null, error: null }
  return await supabase.auth.getSession()
}

export async function getCurrentUser() {
  if (!supabase) return { user: null, error: null }
  return await supabase.auth.getUser()
}

export async function refreshSession() {
  if (!supabase) return
  await supabase.auth.refreshSession()
}

export async function sendPasswordResetEmail(email: string) {
  if (!supabase) return { error: { message: 'Supabase not configured' } as any }
  return await supabase.auth.resetPasswordForEmail(email)
}

export async function updatePassword(newPassword: string) {
  if (!supabase) return { error: { message: 'Supabase not configured' } as any }
  return await supabase.auth.updateUser({ password: newPassword })
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback as any)
}

export default supabase
