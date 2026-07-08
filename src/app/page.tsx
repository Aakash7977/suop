'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, KeyRound, Keyboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { sendPasswordResetEmail } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ─── Password Strength ──────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const config = [
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
    { label: 'Very Strong', color: 'bg-emerald-600' },
  ]

  return { score, ...config[score] }
}

// ─── Login Screen ───────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string, remember: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgot, setShowForgot] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    await onLogin(email, password, remember)
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    setLoading(true)
    setError(null)
    const { error: resetError } = await sendPasswordResetEmail(email)
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setError(null)
      setShowForgot(false)
      alert('Password reset link sent to your email')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true)
    } else {
      setCapsLockOn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">SUOP Admin</h1>
            <p className="text-sm text-slate-400">Sudhastar Unified Operating Platform</p>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            <Shield className="mr-1 h-3 w-3" />
            Enterprise Identity Platform
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="p-6 bg-slate-900/80 backdrop-blur border-slate-700">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sudhastar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  required
                  className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Caps Lock Warning */}
              {capsLockOn && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Keyboard className="h-3 w-3" />
                  Caps Lock is on
                </div>
              )}
              {/* Password Strength (for sign-up context) */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i <= getPasswordStrength(password).score
                            ? getPasswordStrength(password).color
                            : 'bg-slate-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{getPasswordStrength(password).label}</p>
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary"
              />
              <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/50 border border-red-800 p-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Forgot Password Action */}
            {showForgot && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full border-slate-600 text-slate-300"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Send Reset Link
                </Button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6">
            <Separator className="bg-slate-700" />
            <p className="text-center text-xs text-slate-500 mt-4">
              Sprint 3 — Enterprise Identity Platform
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-500">
            SUOP uses enterprise-grade Argon2id password hashing
          </p>
          <p className="text-xs text-slate-600">
            v2.0.0 · 815 Entities · 243 Architectural Decisions
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Screen (shown when authenticated) ────────
function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col border-r bg-sidebar w-64">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">SUOP</p>
            <p className="text-xs text-muted-foreground leading-tight">Sudhastar Unified OS</p>
          </div>
        </div>
        <div className="flex-1 p-3">
          <nav className="space-y-1">
            {['Dashboard', 'Inventory', 'Warehouse', 'Manufacturing', 'Quality', 'Procurement', 'Finance', 'Workforce', 'Maintenance'].map((item, i) => (
              <button
                key={item}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  i === 0
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Sign Out
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 mb-6">
            <h2 className="text-2xl font-bold mb-1">Welcome to SUOP Admin</h2>
            <p className="text-slate-300 text-sm">
              You are now authenticated. Sprint 3 — Enterprise Identity Platform is operational.
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Entities', value: '815' },
              { label: 'Foundation Services', value: '66' },
              { label: 'Arch. Decisions', value: '243' },
              { label: 'Sprint', value: '3' },
            ].map(stat => (
              <Card key={stat.label} className="p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────
export default function Home() {
  const { user, isAuthenticated, isLoading, initialize, login, logout } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleLogin = async (email: string, password: string, _remember: boolean) => {
    await login(email, password)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl animate-pulse">
            S
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Loading SUOP Admin...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated — show login
  if (!isAuthenticated || !user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Authenticated — show dashboard
  return <DashboardScreen onLogout={handleLogout} />
}
