'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, KeyRound, Keyboard,
  Building2, ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, MapPin, Calendar, Package, Box,
  CheckCircle2, Tag, Scale, Image as ImageIcon, FileText,
  Filter, Grid3x3, List, MoreHorizontal, Download, Upload,
  Star, AlertTriangle, GitBranch
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

// ─── Product Data ───────────────────────────────────────
const SAMPLE_PRODUCTS = [
  { upi: 'UPI-000001', code: 'KK-001', sku: 'KAJU-KATLI-250', name: 'Kaju Katli 250g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', category: 'Sweets > Dry Sweets', mrp: 450, stock: 1250, variants: 3 },
  { upi: 'UPI-000002', code: 'KK-002', sku: 'KAJU-KATLI-500', name: 'Kaju Katli 500g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', category: 'Sweets > Dry Sweets', mrp: 850, stock: 850, variants: 1 },
  { upi: 'UPI-000003', code: 'BP-001', sku: 'BADAM-PISTA-250', name: 'Badam Pista Roll 250g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', category: 'Sweets > Dry Sweets', mrp: 520, stock: 650, variants: 2 },
  { upi: 'UPI-000004', code: 'CW-001', sku: 'CHOCO-WAFER-100', name: 'Chocolate Wafer 100g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Shwet', category: 'Bakery > Wafers', mrp: 50, stock: 5200, variants: 4 },
  { upi: 'UPI-000005', code: 'RM-001', sku: 'SUGAR-RAW-50KG', name: 'Raw Sugar 50kg Bag', type: 'RAW_MATERIAL', status: 'ACTIVE', brand: 'Imported', category: 'Raw Material > Sugar', mrp: 0, stock: 12500, variants: 1 },
  { upi: 'UPI-000006', code: 'RM-002', sku: 'CASHEW-W240-10KG', name: 'Cashew W240 10kg Box', type: 'RAW_MATERIAL', status: 'ACTIVE', brand: 'OEM', category: 'Raw Material > Dry Fruits', mrp: 0, stock: 8500, variants: 1 },
  { upi: 'UPI-000007', code: 'PK-001', sku: 'BOX-250G-GIFT', name: 'Gift Box 250g', type: 'PACKAGING', status: 'ACTIVE', brand: 'Private Label', category: 'Packaging > Boxes', mrp: 0, stock: 15000, variants: 2 },
  { upi: 'UPI-000008', code: 'KK-003', sku: 'KAJU-KATLI-1KG', name: 'Kaju Katli 1kg', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', category: 'Sweets > Dry Sweets', mrp: 1650, stock: 420, variants: 1 },
  { upi: 'UPI-000009', code: 'BP-002', sku: 'BURFI-MILK-250', name: 'Milk Burfi 250g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', category: 'Sweets > Milk Sweets', mrp: 380, stock: 980, variants: 2 },
  { upi: 'UPI-000010', code: 'KK-004', sku: 'KAJU-KATLI-100', name: 'Kaju Katli 100g', type: 'FINISHED_GOODS', status: 'DRAFT', brand: 'Sudhamrit', category: 'Sweets > Dry Sweets', mrp: 190, stock: 0, variants: 1 },
  { upi: 'UPI-000011', code: 'OI-001', sku: 'COOKING-OIL-15L', name: 'Cooking Oil 15L Tin', type: 'INGREDIENT', status: 'ACTIVE', brand: 'Imported', category: 'Ingredients > Oils', mrp: 0, stock: 3200, variants: 1 },
  { upi: 'UPI-000012', code: 'CW-002', sku: 'CHOCO-WAFER-200', name: 'Chocolate Wafer 200g', type: 'FINISHED_GOODS', status: 'INACTIVE', brand: 'Shwet', category: 'Bakery > Wafers', mrp: 95, stock: 250, variants: 1 },
]

const PRODUCT_TYPES = [
  { code: 'FINISHED_GOODS', label: 'Finished Goods', color: 'text-emerald-600' },
  { code: 'RAW_MATERIAL', label: 'Raw Materials', color: 'text-orange-600' },
  { code: 'PACKAGING', label: 'Packaging', color: 'text-amber-600' },
  { code: 'SEMI_FINISHED', label: 'Semi-Finished', color: 'text-blue-600' },
  { code: 'CONSUMABLE', label: 'Consumables', color: 'text-muted-foreground' },
  { code: 'INGREDIENT', label: 'Ingredients', color: 'text-purple-600' },
  { code: 'SERVICE', label: 'Services', color: 'text-cyan-600' },
  { code: 'ASSET', label: 'Assets', color: 'text-red-600' },
  { code: 'SPARE_PART', label: 'Spare Parts', color: 'text-indigo-600' },
  { code: 'KITCHEN_ITEM', label: 'Kitchen Items', color: 'text-pink-600' },
  { code: 'GIFT_CARD', label: 'Gift Cards', color: 'text-green-600' },
]

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-600 hover:bg-emerald-600 text-white',
  DRAFT: 'bg-blue-600 hover:bg-blue-600 text-white',
  INACTIVE: 'bg-muted text-muted-foreground',
  BLOCKED: 'bg-red-600 hover:bg-red-600 text-white',
  DISCONTINUED: 'bg-orange-500 hover:bg-orange-500 text-white',
  ARCHIVED: 'bg-slate-500 hover:bg-slate-500 text-white',
}

const CATEGORIES = [
  { code: 'FOOD', name: 'Food Products', level: 1, children: [
    { code: 'SWEETS', name: 'Sweets', level: 2, children: [
      { code: 'DRY_SWEETS', name: 'Dry Sweets', level: 3, products: 4 },
      { code: 'MILK_SWEETS', name: 'Milk Sweets', level: 3, products: 1 },
    ]},
    { code: 'BAKERY', name: 'Bakery', level: 2, children: [
      { code: 'WAFERS', name: 'Wafers', level: 3, products: 2 },
    ]},
  ]},
  { code: 'RAW_MAT', name: 'Raw Materials', level: 1, children: [
    { code: 'SUGAR', name: 'Sugar', level: 2, products: 1 },
    { code: 'DRY_FRUITS', name: 'Dry Fruits', level: 2, products: 1 },
  ]},
  { code: 'INGREDIENTS', name: 'Ingredients', level: 1, children: [
    { code: 'OILS', name: 'Oils', level: 2, products: 1 },
  ]},
  { code: 'PACKAGING_CAT', name: 'Packaging', level: 1, children: [
    { code: 'BOXES', name: 'Boxes', level: 2, products: 1 },
  ]},
]

const BRANDS = [
  { code: 'SUDHAMRIT', name: 'Sudhamrit', products: 5, isPrivate: true },
  { code: 'SHWET', name: 'Shwet', products: 2, isPrivate: true },
  { code: 'PRIVATE', name: 'Private Label', products: 1, isPrivate: true },
  { code: 'OEM', name: 'OEM', products: 1, isPrivate: false },
  { code: 'IMPORTED', name: 'Imported', products: 2, isPrivate: false },
]

const UOMS = [
  { code: 'PCS', name: 'Piece', type: 'COUNT', base: true, decimals: 0 },
  { code: 'KG', name: 'Kilogram', type: 'WEIGHT', base: true, decimals: 3 },
  { code: 'G', name: 'Gram', type: 'WEIGHT', base: false, decimals: 0 },
  { code: 'L', name: 'Liter', type: 'VOLUME', base: true, decimals: 3 },
  { code: 'ML', name: 'Milliliter', type: 'VOLUME', base: false, decimals: 0 },
  { code: 'BOX', name: 'Box', type: 'COUNT', base: false, decimals: 0 },
  { code: 'PKT', name: 'Packet', type: 'COUNT', base: false, decimals: 0 },
  { code: 'TRAY', name: 'Tray', type: 'COUNT', base: false, decimals: 0 },
  { code: 'BTL', name: 'Bottle', type: 'COUNT', base: false, decimals: 0 },
  { code: 'BAG', name: 'Bag', type: 'COUNT', base: false, decimals: 0 },
]

// ─── Login Screen (compact) ─────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string, remember: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">S</div>
          <div>
            <h1 className="text-2xl font-bold text-white">SUOP Admin</h1>
            <p className="text-sm text-slate-400">Sudhastar Unified Operating Platform</p>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300"><Package className="mr-1 h-3 w-3" /> Master Data Platform</Badge>
        </div>
        <Card className="p-6 bg-slate-900/80 backdrop-blur border-slate-700">
          <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onLogin(email, password, remember); setLoading(false) }} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="admin@sudhastar.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary" />
              <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">Remember me for 30 days</Label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>)}</Button>
          </form>
          <Separator className="bg-slate-700 mt-6" />
          <p className="text-center text-xs text-slate-500 mt-4">Sprint 6 — Product Foundation</p>
        </Card>
      </div>
    </div>
  )
}

// ─── Category Tree Node ─────────────────────────────────
function CategoryNode({ cat, depth, selected, onSelect }: { cat: any; depth: number; selected?: string; onSelect: (code: string) => void }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = cat.children && cat.children.length > 0
  return (
    <div>
      <div className={cn('flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50', selected === cat.code && 'bg-primary/10 border border-primary/20')} style={{ paddingLeft: `${depth * 20 + 8}px` }} onClick={() => onSelect(cat.code)}>
        {hasChildren ? <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>{expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</button> : <div className="w-3" />}
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium flex-1 truncate">{cat.name}</span>
        {cat.products && <Badge variant="outline" className="text-xs">{cat.products}</Badge>}
      </div>
      {expanded && hasChildren && cat.children.map((c: any) => <CategoryNode key={c.code} cat={c} depth={depth + 1} selected={selected} onSelect={onSelect} />)}
    </div>
  )
}

// ─── Product Dashboard ──────────────────────────────────
function ProductDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('products')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<typeof SAMPLE_PRODUCTS[0] | null>(null)

  const filteredProducts = SAMPLE_PRODUCTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase()) && !p.code.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && p.type !== typeFilter) return false
    return true
  })

  const sidebarSections = [
    { section: 'Products', items: [
      { name: 'All Products', icon: <Package className="h-4 w-4" />, tab: 'products' },
      { name: 'Categories', icon: <Layers className="h-4 w-4" />, tab: 'categories' },
      { name: 'Brands', icon: <Tag className="h-4 w-4" />, tab: 'brands' },
      { name: 'Units of Measure', icon: <Scale className="h-4 w-4" />, tab: 'uoms' },
    ]},
    { section: 'Operations', items: [
      { name: 'Inventory', icon: <Box className="h-4 w-4" /> },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
      { name: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
    ]},
    { section: 'Administration', items: [
      { name: 'Roles', icon: <Shield className="h-4 w-4" /> },
      { name: 'Organization', icon: <Network className="h-4 w-4" /> },
    ]},
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col border-r bg-sidebar w-64 flex-shrink-0">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">S</div>
          <div><p className="font-bold text-sm leading-tight">SUOP</p><p className="text-xs text-muted-foreground leading-tight">Master Data Platform</p></div>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {sidebarSections.map(s => (
              <div key={s.section}>
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.section}</p>
                <div className="space-y-1">
                  {s.items.map(item => (
                    <button key={item.name} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', 'tab' in item && item.tab === activeTab ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground')} onClick={() => 'tab' in item && setActiveTab(item.tab)}>{item.icon}{item.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4"><Button variant="ghost" size="sm" onClick={onLogout} className="w-full">Sign Out</Button></div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <h1 className="text-lg font-semibold capitalize">{activeTab === 'products' ? 'Product Master' : activeTab}</h1>
          <div className="flex-1" />
          <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />Sprint 6 — Product Foundation</Badge>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <>
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Total Products', value: SAMPLE_PRODUCTS.length, icon: <Package className="h-5 w-5 text-blue-600" /> },
                    { label: 'Active', value: SAMPLE_PRODUCTS.filter(p => p.status === 'ACTIVE').length, icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
                    { label: 'Product Types', value: PRODUCT_TYPES.length, icon: <Layers className="h-5 w-5 text-purple-600" /> },
                    { label: 'With UPI', value: SAMPLE_PRODUCTS.length, icon: <GitBranch className="h-5 w-5 text-indigo-600" /> },
                  ].map(s => (
                    <Card key={s.label} className="p-4">
                      <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </Card>
                  ))}
                </div>

                {/* UPI Banner */}
                <Card className="p-4 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white border-0">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-indigo-300" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Universal Product Identity (UPI) Active</p>
                      <p className="text-xs text-indigo-300">Every product has one permanent identity across Manufacturing, Warehouse, Retail, Restaurant, and Finance</p>
                    </div>
                  </div>
                </Card>

                {/* Toolbar */}
                <Card className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by name, SKU, code, or UPI..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    <select value={typeFilter || ''} onChange={(e) => setTypeFilter(e.target.value || null)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">All Types</option>
                      {PRODUCT_TYPES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                    </select>
                    <Button variant="outline" size="sm"><Filter className="mr-1 h-3 w-3" />Filters</Button>
                    <Button variant="outline" size="sm"><Upload className="mr-1 h-3 w-3" />Import</Button>
                    <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />Export</Button>
                    <div className="flex items-center gap-1 border rounded-md p-0.5">
                      <button className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => setViewMode('list')}><List className="h-4 w-4" /></button>
                      <button className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => setViewMode('grid')}><Grid3x3 className="h-4 w-4" /></button>
                    </div>
                    <Button size="sm"><Plus className="mr-1 h-3 w-3" />New Product</Button>
                  </div>
                </Card>

                {/* Product List */}
                <Card className="p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr className="text-xs font-semibold text-muted-foreground uppercase">
                          <th className="text-left px-4 py-3">UPI</th>
                          <th className="text-left px-4 py-3">Product Code</th>
                          <th className="text-left px-4 py-3">Name</th>
                          <th className="text-left px-4 py-3">SKU</th>
                          <th className="text-left px-4 py-3">Type</th>
                          <th className="text-left px-4 py-3">Brand</th>
                          <th className="text-left px-4 py-3">Category</th>
                          <th className="text-right px-4 py-3">MRP</th>
                          <th className="text-right px-4 py-3">Stock</th>
                          <th className="text-center px-4 py-3">Variants</th>
                          <th className="text-center px-4 py-3">Status</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(p => (
                          <tr key={p.upi} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                            <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-xs">{p.upi}</Badge></td>
                            <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                            <td className="px-4 py-3 font-medium">{p.name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{PRODUCT_TYPES.find(t => t.code === p.type)?.label || p.type}</Badge></td>
                            <td className="px-4 py-3 text-sm">{p.brand}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm">{p.mrp > 0 ? `₹${p.mrp}` : '-'}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm">{p.stock.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-center">{p.variants}</td>
                            <td className="px-4 py-3 text-center"><Badge className={cn('text-xs', STATUS_COLORS[p.status])}>{p.status}</Badge></td>
                            <td className="px-4 py-3"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Selected Product Detail */}
                {selectedProduct && (
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted"><Package className="h-8 w-8 text-muted-foreground" /></div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedProduct.category} · {selectedProduct.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono text-xs">{selectedProduct.upi}</Badge>
                            <Badge variant="outline" className="font-mono text-xs">{selectedProduct.sku}</Badge>
                            <Badge className={cn('text-xs', STATUS_COLORS[selectedProduct.status])}>{selectedProduct.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>Close</Button>
                    </div>
                    <Separator className="mb-4" />
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      <div><p className="text-xs text-muted-foreground mb-1">Product Code</p><p className="text-sm font-mono">{selectedProduct.code}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Product Type</p><Badge variant="outline">{PRODUCT_TYPES.find(t => t.code === selectedProduct.type)?.label}</Badge></div>
                      <div><p className="text-xs text-muted-foreground mb-1">MRP</p><p className="text-sm font-mono">{selectedProduct.mrp > 0 ? `₹${selectedProduct.mrp}` : 'N/A'}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Stock</p><p className="text-sm font-mono">{selectedProduct.stock.toLocaleString('en-IN')} units</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Variants</p><p className="text-sm">{selectedProduct.variants} variant(s)</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Brand</p><p className="text-sm">{selectedProduct.brand}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Category</p><p className="text-sm">{selectedProduct.category}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">UPI Status</p><Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs"><GitBranch className="mr-1 h-3 w-3" />Active</Badge></div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Images: 3</span></div>
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Documents: 2 (FSSAI, Spec)</span></div>
                      <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Default UOM: PCS</span></div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-4 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2"><Layers className="h-5 w-5" /> Product Categories (Unlimited Hierarchy)</h3>
                    <Button size="sm"><Plus className="mr-1 h-3 w-3" />Add Category</Button>
                  </div>
                  <ScrollArea className="h-[500px]">
                    {CATEGORIES.map(cat => <CategoryNode key={cat.code} cat={cat} depth={0} selected={selectedCategory || undefined} onSelect={setSelectedCategory} />)}
                  </ScrollArea>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Category Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Categories</span><span className="font-bold">12</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Root Categories</span><span className="font-bold">4</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Leaf Categories</span><span className="font-bold">7</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Max Depth</span><span className="font-bold">3 levels</span></div>
                    <Separator className="my-3" />
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Products Assigned</span><span className="font-bold">12</span></div>
                  </div>
                </Card>
              </div>
            )}

            {/* Brands Tab */}
            {activeTab === 'brands' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Tag className="h-5 w-5" /> Brand Management</h3>
                  <Button size="sm"><Plus className="mr-1 h-3 w-3" />Create Brand</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {BRANDS.map(b => (
                    <Card key={b.code} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary font-bold">{b.name.charAt(0)}</div>
                        <div><p className="font-medium">{b.name}</p><p className="text-xs text-muted-foreground font-mono">{b.code}</p></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{b.products} products</Badge>
                        {b.isPrivate && <Badge variant="secondary" className="text-xs">Private Label</Badge>}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* UOMs Tab */}
            {activeTab === 'uoms' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Scale className="h-5 w-5" /> Units of Measure</h3>
                  <Button size="sm"><Plus className="mr-1 h-3 w-3" />Add UOM</Button>
                </div>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <span>Code</span><span>Name</span><span>Type</span><span>Base Unit</span><span>Decimals</span>
                  </div>
                  {UOMS.map(u => (
                    <div key={u.code} className="grid grid-cols-5 gap-2 px-4 py-3 border-t text-sm">
                      <span className="font-mono">{u.code}</span><span className="font-medium">{u.name}</span>
                      <Badge variant="outline" className="text-xs w-fit">{u.uomType || u.type}</Badge>
                      <span>{u.base ? '✅ Yes' : 'No'}</span><span>{u.decimals}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="p-3"><p className="text-xs text-muted-foreground">UOM Conversions</p><p className="text-lg font-bold">1 KG = 1000 G</p></Card>
                  <Card className="p-3"><p className="text-xs text-muted-foreground">UOM Conversions</p><p className="text-lg font-bold">1 L = 1000 ML</p></Card>
                  <Card className="p-3"><p className="text-xs text-muted-foreground">UOM Conversions</p><p className="text-lg font-bold">1 BOX = 24 PCS</p></Card>
                </div>
              </Card>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Volume 1 — Part 2: Master Data Platform · Sprint 6 — Product Foundation</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, isLoading, initialize, login, logout } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-center space-y-4"><div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl animate-pulse">S</div><div className="flex items-center justify-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /><p className="text-sm">Loading SUOP Admin...</p></div></div></div>
  if (!isAuthenticated) return <LoginScreen onLogin={async (email, password, remember) => { await login(email, password) }} />
  return <ProductDashboard onLogout={logout} />
}
