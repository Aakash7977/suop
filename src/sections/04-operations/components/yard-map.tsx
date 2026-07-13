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

export function YardMapModule() {
  const yardZones = [
    { zone: 'GATE_ZONE', label: 'Gate Zone', slots: ['G-01', 'G-02', 'G-03'], occupied: 2, capacity: 3, color: 'border-blue-400 bg-blue-50' },
    { zone: 'WAITING', label: 'Waiting Area', slots: ['W-01', 'W-02', 'W-03', 'W-04', 'W-05'], occupied: 4, capacity: 5, color: 'border-amber-400 bg-amber-50' },
    { zone: 'HOLDING', label: 'Holding Area', slots: ['H-01', 'H-02', 'H-03'], occupied: 1, capacity: 3, color: 'border-purple-400 bg-purple-50' },
    { zone: 'STAGING', label: 'Staging Area', slots: ['S-01', 'S-02', 'S-03', 'S-04'], occupied: 3, capacity: 4, color: 'border-emerald-400 bg-emerald-50' },
    { zone: 'COLD_HOLD', label: 'Cold Holding', slots: ['C-01', 'C-02'], occupied: 2, capacity: 2, color: 'border-cyan-400 bg-cyan-50' },
    { zone: 'MAINTENANCE', label: 'Maintenance Bay', slots: ['M-01', 'M-02'], occupied: 1, capacity: 2, color: 'border-orange-400 bg-orange-50' },
  ]

  const vehicles = [
    { slot: 'G-01', vehicle: 'MH12-AB-1234', type: 'CONTAINER', purpose: 'INBOUND', since: '08:45', status: 'AT_GATE' },
    { slot: 'G-02', vehicle: 'KA05-CD-5678', type: 'COLD_TRUCK', purpose: 'INBOUND', since: '09:10', status: 'AT_GATE' },
    { slot: 'W-01', vehicle: 'DL01-EF-9012', type: 'MINI_TRUCK', purpose: 'OUTBOUND', since: '08:30', status: 'WAITING' },
    { slot: 'W-02', vehicle: 'TN09-GH-3456', type: 'TRAILER', purpose: 'OUTBOUND', since: '08:50', status: 'WAITING' },
    { slot: 'W-03', vehicle: 'MH04-IJ-7890', type: 'BULK_TRUCK', purpose: 'INBOUND', since: '09:00', status: 'WAITING' },
    { slot: 'W-04', vehicle: 'GJ01-KL-1234', type: 'SMALL_VAN', purpose: 'PICKUP', since: '09:15', status: 'WAITING' },
    { slot: 'H-01', vehicle: 'MH12-MN-5678', type: 'COURIER_VEHICLE', purpose: 'OUTBOUND', since: '08:40', status: 'IN_YARD' },
    { slot: 'S-01', vehicle: 'KA03-OP-9012', type: 'MILK_TANKER', purpose: 'INBOUND', since: '09:05', status: 'READY' },
    { slot: 'S-02', vehicle: 'DL01-ST-9012', type: 'CONTAINER', purpose: 'OUTBOUND', since: '08:55', status: 'READY' },
    { slot: 'S-03', vehicle: 'MH12-XY-2222', type: 'TRAILER', purpose: 'OUTBOUND', since: '09:00', status: 'READY' },
    { slot: 'C-01', vehicle: 'TN09-COLD-01', type: 'COLD_TRUCK', purpose: 'INBOUND', since: '08:50', status: 'IN_YARD' },
    { slot: 'C-02', vehicle: 'KA05-COLD-02', type: 'COLD_TRUCK', purpose: 'OUTBOUND', since: '09:00', status: 'READY' },
    { slot: 'M-01', vehicle: 'MH04-REP-01', type: 'OWN_FLEET', purpose: 'SERVICE', since: '08:00', status: 'IN_YARD' },
  ]

  const getVehicleForSlot = (slot: string) => vehicles.find(v => v.slot === slot)

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Yard Map</h2><p className="text-sm text-muted-foreground mt-1">Visual layout of yard zones · slot occupancy · vehicle positions</p></div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Slots', value: yardZones.reduce((a, z) => a + z.capacity, 0), color: 'text-blue-600' },
          { label: 'Occupied', value: yardZones.reduce((a, z) => a + z.occupied, 0), color: 'text-amber-600' },
          { label: 'Available', value: yardZones.reduce((a, z) => a + z.capacity - z.occupied, 0), color: 'text-emerald-600' },
          { label: 'Vehicles in Yard', value: vehicles.length, color: 'text-purple-600' },
          { label: 'Ready to Exit', value: vehicles.filter(v => v.status === 'READY').length, color: 'text-emerald-700' },
          { label: 'At Gate', value: vehicles.filter(v => v.status === 'AT_GATE').length, color: 'text-blue-700' },
        ].map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Yard Layout — WH-MUM-MAIN</h3>
        <div className="space-y-4">
          {yardZones.map(zone => (
            <div key={zone.zone} className={`p-4 rounded-lg border-2 ${zone.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div><span className="font-semibold text-sm">{zone.label}</span><span className="ml-2 text-xs text-muted-foreground font-mono">{zone.zone}</span></div>
                <Badge variant="outline">{zone.occupied}/{zone.capacity} occupied</Badge>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {zone.slots.map(slot => {
                  const v = getVehicleForSlot(slot)
                  return (
                    <div key={slot} className={`p-2 rounded border-2 ${v ? 'border-amber-400 bg-amber-100' : 'border-dashed border-slate-300 bg-white'}`}>
                      <div className="text-xs font-mono font-semibold">{slot}</div>
                      {v ? (<>
                        <div className="text-[10px] font-mono mt-1 truncate">{v.vehicle}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{v.type.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] text-blue-600 mt-0.5">Since {v.since}</div>
                      </>) : <div className="text-[10px] text-muted-foreground text-center mt-1">Empty</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Yard Vehicle List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b"><tr>
              <th className="text-left px-4 py-2 font-medium">Slot</th><th className="text-left px-4 py-2 font-medium">Vehicle</th>
              <th className="text-left px-4 py-2 font-medium">Type</th><th className="text-left px-4 py-2 font-medium">Purpose</th>
              <th className="text-left px-4 py-2 font-medium">Since</th><th className="text-left px-4 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {vehicles.map((v, i) => {
                const b = s28BadgeForStatus(v.status)
                return (
                  <tr key={i} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">{v.slot}</td>
                    <td className="px-4 py-2 font-mono text-xs font-medium">{v.vehicle}</td>
                    <td className="px-4 py-2 text-[10px]">{v.type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2 text-[10px] font-mono">{v.purpose}</td>
                    <td className="px-4 py-2 font-mono text-xs">{v.since}</td>
                    <td className="px-4 py-2"><span className={`text-[10px] px-2 py-0.5 rounded ${b.cls}`}>{b.label}</span></td>
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

// ─── Epic 2: Vehicle Tracker Module ─────────────────────
