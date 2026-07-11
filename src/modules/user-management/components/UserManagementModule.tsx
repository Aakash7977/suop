'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  userMgmtApi, type UserListItem, type RoleItem, type PermissionItem,
} from '../api/client'
import {
  Users, Shield, Key, Plus, Search, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, Lock, Unlock, Smartphone, Clock, FileText, Network,
} from 'lucide-react'

// ─── Shared ─────────────────────────────────────────────────────────────────

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{message}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div>
}
function EmptyState({ message }: { message: string }) {
  return <div className="flex flex-col items-center justify-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{message}</p></div>
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', ACTIVE: 'bg-emerald-100 text-emerald-700',
  LOCKED: 'bg-red-100 text-red-700', DISABLED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-zinc-100 text-zinc-500', INVITED: 'bg-blue-100 text-blue-700',
  DEPRECATED: 'bg-orange-100 text-orange-700',
}

// ─── User Directory ─────────────────────────────────────────────────────────

function UserDirectory({ onUserClick }: { onUserClick: (id: string) => void }) {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await userMgmtApi.listUsers({ page, search: search || undefined })
      setUsers(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleLock = async (id: string, name: string) => {
    try { await userMgmtApi.lockUser(id); setSuccessMsg(`User "${name}" locked`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }
  const handleUnlock = async (id: string, name: string) => {
    try { await userMgmtApi.unlockUser(id); setSuccessMsg(`User "${name}" unlocked`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Directory</h2>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Invite User</Button>
      </div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {users.length === 0 ? <EmptyState message="No users found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Designation</th><th className="text-left px-4 py-3">Last Login</th>
                <th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => onUserClick(u.id)}>
                    <td className="px-4 py-3 font-medium text-sm">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3 text-sm">{u.email}</td>
                    <td className="px-4 py-3 text-xs">{u.designation || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[u.status] || 'bg-slate-100'}`}>{u.status}</Badge></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        {u.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleLock(u.id, `${u.first_name} ${u.last_name}`)}><Lock className="mr-1 h-3 w-3" />Lock</Button>}
                        {u.status === 'LOCKED' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUnlock(u.id, `${u.first_name} ${u.last_name}`)}><Unlock className="mr-1 h-3 w-3" />Unlock</Button>}
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onUserClick(u.id)}>Details <ChevronRight className="ml-1 h-3 w-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
      {total > 25 && (<div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{total} users · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

// ─── User Details ───────────────────────────────────────────────────────────

function UserDetails({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [sessions, setSessions] = useState<unknown[]>([])
  const [history, setHistory] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [userRes, sessRes, histRes] = await Promise.all([
        userMgmtApi.getUser(userId),
        userMgmtApi.getUserSessions(userId),
        userMgmtApi.getUserLoginHistory(userId),
      ])
      setUser(userRes.data); setSessions(sessRes.data); setHistory(histRes.data)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!user) return <EmptyState message="User not found" />

  return (
    <div className="space-y-4">
      <Button size="sm" variant="ghost" onClick={onBack}><ChevronRight className="mr-1 h-4 w-4 rotate-180" />Back to Users</Button>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
            {String(user['first_name'] ?? 'U')[0]}{String(user['last_name'] ?? '')[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{String(user['first_name'])} {String(user['last_name'])}</h2>
            <p className="text-sm text-muted-foreground">{String(user['email'])}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-[10px] ${statusColors[String(user['status'])] || 'bg-slate-100'}`}>{String(user['status'])}</Badge>
              {user['email_verified'] && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" />Email Verified</Badge>}
              {user['mfa_enabled'] && <Badge className="bg-blue-100 text-blue-700 text-[10px]"><Shield className="mr-1 h-3 w-3" />MFA</Badge>}
            </div>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Smartphone className="h-5 w-5 text-blue-600" />Active Sessions ({sessions.length})</h3>
          {sessions.length === 0 ? <EmptyState message="No active sessions" /> : (
            <div className="space-y-2">
              {sessions.map((s: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <div><p className="text-xs font-medium">{String(s['device_name'] ?? 'Unknown device')}</p><p className="text-[10px] text-muted-foreground">{String(s['ip_address'] ?? 'Unknown IP')}</p></div>
                  <Badge variant="outline" className="text-[10px]">{new Date(String(s['issued_at'])).toLocaleDateString()}</Badge>
                </div>
              ))}
              <Button size="sm" variant="outline" className="mt-2" onClick={async () => { await userMgmtApi.revokeAllSessions(userId); load() }}>Revoke All Sessions</Button>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-amber-600" />Login History</h3>
          {history.length === 0 ? <EmptyState message="No login history" /> : (
            <div className="space-y-2">
              {(history as Record<string, unknown>[]).slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {h['success'] ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                    <div><p className="text-xs font-medium">{h['success'] ? 'Success' : String(h['failure_reason'] ?? 'Failed')}</p><p className="text-[10px] text-muted-foreground">{String(h['ip_address'] ?? '—')}</p></div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(String(h['timestamp'])).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Role Management ────────────────────────────────────────────────────────

function RoleManagement() {
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await userMgmtApi.listRoles({ page, search: search || undefined })
      setRoles(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Role Management</h2>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Role</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search roles..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {roles.length === 0 ? <EmptyState message="No roles found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Display Name</th>
                <th className="text-left px-4 py-3">Category</th><th className="text-center px-4 py-3">System</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{r.name}</td>
                    <td className="px-4 py-3 font-medium text-sm">{r.display_name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{r.category}</Badge></td>
                    <td className="px-4 py-3 text-center">{r.is_system && <Shield className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[r.status] || 'bg-slate-100'}`}>{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Permission Matrix ──────────────────────────────────────────────────────

function PermissionMatrix() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await userMgmtApi.listPermissions({ search: search || undefined, module: moduleFilter || undefined })
      setPermissions(result.data)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [search, moduleFilter])

  useEffect(() => { load() }, [load])

  // Group by module
  const grouped: Record<string, PermissionItem[]> = {}
  for (const p of permissions) {
    if (!grouped[p.module]) grouped[p.module] = []
    grouped[p.module].push(p)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Permission Matrix</h2>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search permissions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All Modules</option>
          {Object.keys(grouped).sort().map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([module, perms]) => (
            <Card key={module} className="p-4">
              <h3 className="font-semibold text-sm mb-3 capitalize">{module} ({perms.length})</h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {perms.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2 border rounded">
                    <Key className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-medium truncate">{p.code}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.display_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Module ────────────────────────────────────────────────────────────

type AdminTab = 'users' | 'roles' | 'permissions' | 'delegations'

const TABS: Array<{ key: AdminTab; label: string; icon: React.ReactNode }> = [
  { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { key: 'roles', label: 'Roles', icon: <Shield className="h-4 w-4" /> },
  { key: 'permissions', label: 'Permissions', icon: <Key className="h-4 w-4" /> },
  { key: 'delegations', label: 'Delegations', icon: <Network className="h-4 w-4" /> },
]

export function UserManagementModule() {
  const [tab, setTab] = useState<AdminTab>('users')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelectedUserId(null) }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab === 'users' && (selectedUserId
        ? <UserDetails userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        : <UserDirectory onUserClick={setSelectedUserId} />
      )}
      {tab === 'roles' && <RoleManagement />}
      {tab === 'permissions' && <PermissionMatrix />}
      {tab === 'delegations' && <EmptyState message="Approval delegations — coming soon" />}
    </div>
  )
}
