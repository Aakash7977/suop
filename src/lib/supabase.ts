/**
 * SUOP — Supabase Client
 * Sprint 3: Epic 2 — Authentication Module
 *
 * Uses Supabase as the Identity Provider (IdP) abstraction layer.
 * Per Chief Architect recommendation: IdP Abstraction Layer allows
 * future addition of Google, Microsoft, LDAP, SAML without rewriting auth.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key not configured. Check .env file.')
}

// ─── Supabase Client ────────────────────────────────────
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// ─── Auth Provider Types (IdP Abstraction) ──────────────
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

/**
 * Sign in with email and password (LOCAL provider)
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  return { data, error }
}

/**
 * Sign in with OAuth provider (Google, Microsoft, etc.)
 */
export async function signInWithOAuth(provider: 'google' | 'azure' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Refresh session
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()
  return { data, error }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { data, error }
}

/**
 * Update password (after reset or change)
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  return { data, error }
}

/**
 * Send email verification
 */
export async function resendEmailVerification(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  return { data, error }
}

/**
 * Auth state change listener
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// ─── Default Export ─────────────────────────────────────
export default supabase
