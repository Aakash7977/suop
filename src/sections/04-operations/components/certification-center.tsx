/**
 * Section 04 — Operations & WMS
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, Calendar, Package, Box,
  CheckCircle2, Tag, Scale, FileText, Filter, Download, Upload,
  GitBranch, FolderTree, FileCheck,
  History, ClipboardCheck, ShieldCheck, Archive,
  Building2, MapPin, Flag, Menu as MenuIcon, AlertTriangle,
  Server, Database, Zap, Activity, HardDrive,
  Bell, X, Menu, Star, Grid3x3, List, MoreHorizontal,
  IndianRupee, Percent, TrendingUp, TrendingDown, Clock,
  Calculator, Gift, Sparkles, PlayCircle, ArrowRightCircle,
  Users2, Handshake, Award, CreditCard, MapPinned, Phone,
  Building, Globe2, Star as StarIcon, Shield as ShieldIcon, AlertCircle as AlertIcon,
  QrCode, ScanLine, PackageCheck, Boxes, Hash, Tag as TagIcon, Printer,
  Barcode, Route, ArrowDownToLine, ArrowUpFromLine, History as HistoryIcon, Search as SearchIcon,
  GitMerge, FileCheck2, FileX2, AlertOctagon, ClipboardList, FileSpreadsheet,
  DownloadCloud, UploadCloud, ShieldAlert, Gauge, ListChecks, Workflow, RefreshCw,
  PackageOpen, ArrowLeftRight, BookOpen, Layers3, Activity as ActivityIcon,
  Truck, PackageCheck as PackageCheckIcon, FlaskConical, MapPin as MapPinIcon,
  Trash2, AlertTriangle as AlertTriangleIcon,
  Thermometer, Snowflake, Droplets, ScanLine as ScanIcon,
  Lock as LockIcon, UserCog, ArrowDownToLine as ArrowDownToLineIcon,
  Waves, Radio, Siren, UserCheck, Target, BatteryLow, Timer, Radar, Smartphone, BellRing,
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
  UtensilsCrossed as UtensilsCrossedIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { s28BadgeForStatus, s28PriorityBadge, S28_WAREHOUSES, S28_ZONES } from '../utils/helpers'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'

export function CertificationCenterModule() {
  const certifications = [
    { id: 'C1', code: 'CERT-001', op: 'OP-001 Rajesh Kumar', type: 'FORKLIFT_LICENSE', name: 'Forklift Operating License', issuedBy: 'NSDC', issuedAt: '2024-03-15', certNum: 'NSDC-FL-2024-001', validFrom: '2024-03-15', validUntil: '2027-03-15', expired: false, expiringSoon: false, score: 92, equipmentType: 'FORKLIFT', status: 'ACTIVE' },
    { id: 'C2', code: 'CERT-002', op: 'OP-001 Rajesh Kumar', type: 'REACH_TRUCK', name: 'Reach Truck Certification', issuedBy: 'MANUFACTURER', issuedAt: '2024-04-20', certNum: 'CROWN-RT-2024-005', validFrom: '2024-04-20', validUntil: '2026-04-20', expired: false, expiringSoon: true, score: 88, equipmentType: 'REACH_TRUCK', status: 'ACTIVE' },
    { id: 'C3', code: 'CERT-003', op: 'OP-003 Suresh Mehta', type: 'FORKLIFT_LICENSE', name: 'Forklift Operating License', issuedBy: 'NSDC', issuedAt: '2023-11-10', certNum: 'NSDC-FL-2023-118', validFrom: '2023-11-10', validUntil: '2026-11-10', expired: false, expiringSoon: false, score: 95, equipmentType: 'FORKLIFT', status: 'ACTIVE' },
    { id: 'C4', code: 'CERT-004', op: 'OP-002 Anita Sharma', type: 'COLD_STORAGE', name: 'Cold Storage Handling', issuedBy: 'INTERNAL', issuedAt: '2024-06-01', certNum: 'SUOP-CS-2024-002', validFrom: '2024-06-01', validUntil: '2026-06-01', expired: true, expiringSoon: false, score: 84, equipmentType: null, status: 'EXPIRED' },
    { id: 'C5', code: 'CERT-005', op: 'OP-005 Ramesh Patel', type: 'FORKLIFT_LICENSE', name: 'Forklift Operating License', issuedBy: 'NSDC', issuedAt: '2023-08-15', certNum: 'NSDC-FL-2023-082', validFrom: '2023-08-15', validUntil: '2026-08-15', expired: false, expiringSoon: true, score: 81, equipmentType: 'FORKLIFT', status: 'PENDING_RENEWAL' },
    { id: 'C6', code: 'CERT-006', op: 'OP-006 Mahesh Reddy', type: 'HAZARDOUS_GOODS', name: 'Hazardous Goods Handling', issuedBy: 'GOVT_BODY', issuedAt: '2024-02-10', certNum: 'GOVT-HG-2024-018', validFrom: '2024-02-10', validUntil: '2027-02-10', expired: false, expiringSoon: false, score: 89, equipmentType: null, status: 'ACTIVE' },
    { id: 'C7', code: 'CERT-007', op: 'OP-001 Rajesh Kumar', type: 'FIRST_AID', name: 'First Aid Certification', issuedBy: 'INTERNAL', issuedAt: '2024-01-05', certNum: 'SUOP-FA-2024-001', validFrom: '2024-01-05', validUntil: '2026-01-05', expired: true, expiringSoon: false, score: 96, equipmentType: null, status: 'EXPIRED' },
    { id: 'C8', code: 'CERT-008', op: 'OP-003 Suresh Mehta', type: 'SAFETY_TRAINING', name: 'Warehouse Safety Training', issuedBy: 'INTERNAL', issuedAt: '2024-05-20', certNum: 'SUOP-ST-2024-003', validFrom: '2024-05-20', validUntil: '2026-05-20', expired: false, expiringSoon: false, score: 94, equipmentType: null, status: 'ACTIVE' },
  ]

  const stats = [
    { label: 'Total Certifications', value: certifications.length, color: 'text-blue-600' },
    { label: 'Active', value: certifications.filter(c => c.status === 'ACTIVE').length, color: 'text-emerald-600' },
    { label: 'Expiring Soon', value: certifications.filter(c => c.expiringSoon).length, color: 'text-amber-600' },
    { label: 'Expired', value: certifications.filter(c => c.expired).length, color: 'text-rose-600' },
    { label: 'Pending Renewal', value: certifications.filter(c => c.status === 'PENDING_RENEWAL').length, color: 'text-orange-600' },
    { label: 'Avg Score', value: `${Math.round(certifications.reduce((a, c) => a + c.score, 0) / certifications.length)}%`, color: 'text-purple-600' },
  ]

  const certTypes = ['FORKLIFT_LICENSE', 'REACH_TRUCK', 'COLD_STORAGE', 'HAZARDOUS_GOODS', 'FIRST_AID', 'SAFETY_TRAINING', 'EQUIPMENT_TRAINING', 'FIRE_SAFETY']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Certification Center</h2><p className="text-sm text-muted-foreground mt-1">Operator licenses · safety training · equipment certifications · expiry tracking</p></div>
        <Button size="sm"><Plus className="mr-2 h-4 w-4" />Issue Certification</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-600 flex items-center justify-center text-white"><ShieldCheck className="h-5 w-5" /></div>
          <div><p className="font-semibold text-sm">Certification Validation Rule</p><p className="text-xs text-muted-foreground">Tasks requiring certification will only be assigned to operators with valid (non-expired) certifications. Expired certifications block task assignment automatically.</p></div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm">Certification Type Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {certTypes.map(t => {
            const count = certifications.filter(c => c.type === t).length
            const active = certifications.filter(c => c.type === t && c.status === 'ACTIVE').length
            const expired = certifications.filter(c => c.type === t && c.expired).length
            return (
              <div key={t} className="p-2 border rounded">
                <div className="font-mono text-[10px] font-semibold text-blue-700">{t.replace(/_/g, ' ')}</div>
                <div className="flex items-center gap-2 mt-1 text-[10px]"><span className="text-emerald-600">{active} active</span><span className="text-rose-600">{expired} expired</span><span className="text-muted-foreground">/ {count} total</span></div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b"><h3 className="font-semibold">All Certifications</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium">Cert #</th><th className="text-left px-4 py-3 font-medium">Operator</th>
              <th className="text-left px-4 py-3 font-medium">Type</th><th className="text-left px-4 py-3 font-medium">Issued By</th>
              <th className="text-left px-4 py-3 font-medium">Cert Number</th><th className="text-left px-4 py-3 font-medium">Valid Until</th>
              <th className="text-left px-4 py-3 font-medium">Score</th><th className="text-left px-4 py-3 font-medium">Equipment</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {certifications.map(c => {
                const b = s28BadgeForStatus(c.status)
                return (
                  <tr key={c.id} className={`border-b hover:bg-muted/30 ${c.expired ? 'bg-rose-50/30' : c.expiringSoon ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td>
                    <td className="px-4 py-3 text-xs">{c.op}</td>
                    <td className="px-4 py-3"><span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{c.type.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3 text-[10px]">{c.issuedBy}</td>
                    <td className="px-4 py-3 font-mono text-[10px]">{c.certNum}</td>
                    <td className="px-4 py-3 font-mono text-xs"><span className={c.expired ? 'text-rose-600 font-bold' : c.expiringSoon ? 'text-amber-600 font-bold' : ''}>{c.validUntil}</span>{c.expiringSoon && !c.expired && <span className="text-[9px] text-amber-600 ml-1">⚠ soon</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs"><span className={c.score > 90 ? 'text-emerald-600' : c.score > 80 ? 'text-amber-600' : 'text-rose-600'}>{c.score}%</span></td>
                    <td className="px-4 py-3 text-[10px] font-mono">{c.equipmentType || '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 8: Equipment Analytics Module ─────────────────
