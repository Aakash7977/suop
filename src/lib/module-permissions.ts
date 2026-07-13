/**
 * @suop/frontend — Module Permission Map
 *
 * Maps every sidebar module key to the permission(s) required to access it.
 * Used by:
 *   - Sidebar (filter items by permission)
 *   - Module render gate (block unauthorized module access)
 *   - Dashboard cards (hide cards user can't access)
 *
 * If a module maps to multiple permissions, the user needs ANY of them
 * (OR semantics) — defined per entry via `anyOf: true`.
 *
 * Modules not in this map default to requiring 'org:view' (broad access).
 * Empty/null permission means "any authenticated user can access" (e.g., dashboard).
 */

import type { ModuleKey } from '@/app/page'

export interface ModulePermission {
  /** Required permission(s). Empty array = any authenticated user. */
  permissions: string[]
  /** If true, user needs ANY of the permissions. If false (default), needs ALL. */
  anyOf?: boolean
}

export const MODULE_PERMISSIONS: Partial<Record<ModuleKey, ModulePermission>> = {
  // ─── Overview ─────────────────────────────────────────────────────────
  dashboard: { permissions: [] }, // any authenticated user

  // ─── Master Data ──────────────────────────────────────────────────────
  products: { permissions: ['catalog:view', 'catalog:read'], anyOf: true },
  pim: { permissions: ['catalog:view', 'catalog:read'], anyOf: true },
  commercial: { permissions: ['pricing:read', 'catalog:read'], anyOf: true },
  partners: { permissions: ['customer:view', 'supplier:view'], anyOf: true },
  identification: { permissions: ['batch:view', 'batch:read'], anyOf: true },
  governance: { permissions: ['org:view', 'audit:read'], anyOf: true },

  // ─── Platform ─────────────────────────────────────────────────────────
  organization: { permissions: ['org:view', 'org:read'], anyOf: true },
  rbac: { permissions: ['auth:manage_users', 'auth:manage_roles', 'audit:read'], anyOf: true },
  settings: { permissions: ['system:settings'] },

  // ─── Operations ───────────────────────────────────────────────────────
  inventory: { permissions: ['inventory:view', 'inventory:read'], anyOf: true },
  goodsreceipt: { permissions: ['grn:view', 'grn:read'], anyOf: true },
  stockissue: { permissions: ['inventory:view', 'inventory:read'], anyOf: true },
  transfer: { permissions: ['inventory:transfer', 'inventory:view'], anyOf: true },
  adjustment: { permissions: ['inventory:adjust', 'inventory:view'], anyOf: true },
  reservation: { permissions: ['inventory:reserve', 'inventory:view'], anyOf: true },
  cyclecount: { permissions: ['cyclecount:read', 'inventory:view'], anyOf: true },
  batchmgmt: { permissions: ['batch:view', 'batch:read'], anyOf: true },
  costing: { permissions: ['costing:read'] },
  analytics: { permissions: ['bi:view', 'bi:read'], anyOf: true },
  warehouse: { permissions: ['warehouse:view', 'warehouse:read'], anyOf: true },
  whlocations: { permissions: ['warehouse:view', 'warehouse:read'], anyOf: true },
  receiving: { permissions: ['grn:view', 'grn:read'], anyOf: true },
  putaway: { permissions: ['putaway:view', 'putaway:read'], anyOf: true },
  fulfillment: { permissions: ['pick:view', 'pick:read', 'pack:read'], anyOf: true },
  dispatch: { permissions: ['shipment:read', 'delivery:read'], anyOf: true },
  waveplanning: { permissions: ['wave:view', 'wave:read'], anyOf: true },
  taskqueue: { permissions: ['pick:view', 'putaway:view'], anyOf: true },
  workforce: { permissions: ['hr:view', 'hr:read'], anyOf: true },
  equipment: { permissions: ['eam:read'] },
  controltower: { permissions: ['bi:view', 'controltower:read'], anyOf: true },
  sladashboard: { permissions: ['bi:view', 'bi:read'], anyOf: true },
  exceptioncenter: { permissions: ['alerts:read', 'inventory:view'], anyOf: true },
  workforceanalytics: { permissions: ['hr:view', 'bi:view'], anyOf: true },
  crossdock: { permissions: ['inventory:view', 'warehouse:view'], anyOf: true },
  truckqueue: { permissions: ['warehouse:view', 'shipment:read'], anyOf: true },
  dockschedule: { permissions: ['warehouse:view', 'shipment:read'], anyOf: true },
  yardmap: { permissions: ['warehouse:view'] },
  vehicletracker: { permissions: ['warehouse:view', 'shipment:read'], anyOf: true },
  gateconsole: { permissions: ['warehouse:view'] },
  yardtower: { permissions: ['warehouse:view', 'bi:view'], anyOf: true },
  crossdockanalytics: { permissions: ['bi:view', 'warehouse:view'], anyOf: true },
  equipmentmaster: { permissions: ['eam:read'] },
  forkliftdashboard: { permissions: ['eam:read'] },
  scannermgmt: { permissions: ['scan:read', 'barcode:read'], anyOf: true },
  batterydashboard: { permissions: ['eam:read'] },
  maintenanceplanner: { permissions: ['eam:maintenance'] },
  breakdownconsole: { permissions: ['eam:read', 'alerts:read'], anyOf: true },
  certificationcenter: { permissions: ['hr:view', 'eam:read'], anyOf: true },
  equipmentanalytics: { permissions: ['eam:read', 'bi:view'], anyOf: true },

  // ─── Warehouse Analytics ──────────────────────────────────────────────
  missioncontrol: { permissions: ['bi:view', 'bi:read'], anyOf: true },
  kpidashboard: { permissions: ['bi:view', 'bi:read'], anyOf: true },
  operatoranalytics: { permissions: ['bi:view', 'hr:view'], anyOf: true },
  wareheatanalytics: { permissions: ['bi:view', 'eam:read'], anyOf: true },
  heatmaps: { permissions: ['bi:view'] },
  costdashboard: { permissions: ['bi:view', 'costing:read'], anyOf: true },
  slaanalytics: { permissions: ['bi:view'] },
  execreports: { permissions: ['bi:view', 'audit:read'], anyOf: true },

  // ─── Command Center & AI Ops ──────────────────────────────────────────
  wmsmissioncontrol: { permissions: ['bi:view', 'missioncontrol:read'], anyOf: true },
  digitaltwin: { permissions: ['bi:view'] },
  aioperations: { permissions: ['bi:view'] },
  execdashboard: { permissions: ['bi:view'] },
  alertcenter: { permissions: ['alerts:read'] },
  recoverydashboard: { permissions: ['bi:view', 'system:settings'], anyOf: true },
  enterprisenalytics: { permissions: ['bi:view'] },

  // ─── Manufacturing ────────────────────────────────────────────────────
  plantmaster: { permissions: ['org:view', 'org:read'], anyOf: true },
  productiondept: { permissions: ['org:view'] },
  productionlines: { permissions: ['production:read'] },
  workcenters: { permissions: ['production:read'] },
  mfgcalendar: { permissions: ['production:read'] },
  mfgresources: { permissions: ['production:read'] },
  plantconfig: { permissions: ['org:settings', 'system:settings'], anyOf: true },
  productiondashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  recipemaster: { permissions: ['recipe:read'] },
  formulabuilder: { permissions: ['recipe:read'] },
  bombuilder: { permissions: ['recipe:read'] },
  recipeversions: { permissions: ['recipe:read'] },
  yielddashboard: { permissions: ['recipe:read', 'bi:view'], anyOf: true },
  batchscaling: { permissions: ['batch:view', 'recipe:read'], anyOf: true },
  nutritioncenter: { permissions: ['recipe:read', 'catalog:read'], anyOf: true },
  costrollup: { permissions: ['costing:read', 'recipe:read'], anyOf: true },
  recipeapproval: { permissions: ['recipe:approve', 'recipe:read'], anyOf: true },
  planningdashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  mpsconsole: { permissions: ['production:read'] },
  mrpworkbench: { permissions: ['production:read'] },
  demandplanning: { permissions: ['production:read'] },
  capacityplanner: { permissions: ['production:read'] },
  shortagecenter: { permissions: ['production:read', 'inventory:view'], anyOf: true },
  purchasesuggestions: { permissions: ['production:read', 'po:view'], anyOf: true },
  whatifsimulator: { permissions: ['production:read', 'bi:view'], anyOf: true },
  productionorders: { permissions: ['production:read'] },
  workorders: { permissions: ['production:read'] },
  routingdesigner: { permissions: ['production:read'] },
  shopfloorschedule: { permissions: ['production:read'] },
  productiontraveler: { permissions: ['production:read'] },
  assignmentconsole: { permissions: ['production:read'] },
  proddashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  progressmonitor: { permissions: ['production:read'] },
  shopfloordashboard: { permissions: ['production:read', 'mes:read'], anyOf: true },
  woconsole: { permissions: ['production:read', 'mes:read'], anyOf: true },
  materialconsumption: { permissions: ['production:read', 'inventory:view'], anyOf: true },
  machineconsole: { permissions: ['mes:read', 'eam:read'], anyOf: true },
  operatordashboard: { permissions: ['mes:read', 'hr:view'], anyOf: true },
  wipdashboard: { permissions: ['mes:read', 'production:read'], anyOf: true },
  andonboard: { permissions: ['mes:read', 'alerts:read'], anyOf: true },
  prodexceptions: { permissions: ['mes:read', 'alerts:read'], anyOf: true },

  // ─── Batch Traceability ───────────────────────────────────────────────
  batchmaster: { permissions: ['batch:view', 'batch:read'], anyOf: true },
  batchgenealogy: { permissions: ['batch:trace', 'batch:read'], anyOf: true },
  traceabilitysearch: { permissions: ['batch:trace', 'batch:read'], anyOf: true },
  recallcenter: { permissions: ['recall:read', 'recall:initiate'], anyOf: true },
  expirydashboard: { permissions: ['batch:view', 'inventory:view'], anyOf: true },
  shelflifemonitor: { permissions: ['batch:view', 'inventory:view'], anyOf: true },
  compliancedashboard: { permissions: ['recall:read', 'audit:read'], anyOf: true },
  batchhistory: { permissions: ['batch:read', 'batch:trace'], anyOf: true },
  batchsplitmerge: { permissions: ['batch:split', 'batch:merge'], anyOf: true },

  // ─── Production Mobile ────────────────────────────────────────────────
  prodmobilecontrol: { permissions: ['production:read', 'mes:read'], anyOf: true },
  womobileconsole: { permissions: ['production:read', 'mes:read'], anyOf: true },
  mobilequalitycenter: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  labelprintjobs: { permissions: ['barcode:print', 'barcode:read'], anyOf: true },
  proddevicemgr: { permissions: ['system:settings', 'scan:read'], anyOf: true },
  prodsyncmonitor: { permissions: ['system:settings', 'scan:read'], anyOf: true },

  // ─── Packaging & FG ───────────────────────────────────────────────────
  packagingdashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  packagingorders: { permissions: ['production:read'] },
  packagehierarchy: { permissions: ['batch:view', 'production:read'], anyOf: true },
  packaginglabels: { permissions: ['barcode:print', 'barcode:read'], anyOf: true },
  packagingquality: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  finishedgoods: { permissions: ['catalog:view', 'production:read'], anyOf: true },
  packagingcost: { permissions: ['costing:read'] },
  warehousehandover: { permissions: ['inventory:view', 'warehouse:view'], anyOf: true },

  // ─── Mfg Cost & Finance ───────────────────────────────────────────────
  batchcostanalysis: { permissions: ['costing:read'] },
  variancedashboard: { permissions: ['costing:read', 'bi:view'], anyOf: true },
  laborcost: { permissions: ['costing:read', 'hr:view'], anyOf: true },
  machinecost: { permissions: ['costing:read', 'eam:read'], anyOf: true },
  utilitycost: { permissions: ['costing:read'] },
  overheadallocation: { permissions: ['costing:read'] },
  mfgcostrollup: { permissions: ['costing:read'] },
  mfgfinance: { permissions: ['finance:read', 'costing:read'], anyOf: true },

  // ─── Machine & IoT ────────────────────────────────────────────────────
  machinedashboard: { permissions: ['eam:read', 'mes:read'], anyOf: true },
  machinemaster: { permissions: ['eam:read'] },
  iotgateway: { permissions: ['eam:read', 'system:settings'], anyOf: true },
  plcmonitor: { permissions: ['eam:read'] },
  sensordashboard: { permissions: ['eam:read', 'bi:view'], anyOf: true },
  machinetimeline: { permissions: ['eam:read'] },
  equipmenthealth: { permissions: ['eam:read'] },
  productioncounters: { permissions: ['mes:read', 'eam:read'], anyOf: true },

  // ─── OEE & Analytics ──────────────────────────────────────────────────
  oeedashboard: { permissions: ['mes:read', 'bi:view'], anyOf: true },
  productionanalytics: { permissions: ['production:read', 'bi:view'], anyOf: true },
  machineanalytics: { permissions: ['eam:read', 'bi:view'], anyOf: true },
  mfgoperanalytics: { permissions: ['hr:view', 'bi:view'], anyOf: true },
  downtimecenter: { permissions: ['mes:read', 'alerts:read'], anyOf: true },
  mfghtemaps: { permissions: ['bi:view'] },
  costanalytics: { permissions: ['costing:read', 'bi:view'], anyOf: true },
  execmfgdashboard: { permissions: ['bi:view'] },

  // ─── Waste & Yield ────────────────────────────────────────────────────
  wastedashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  scrapcenter: { permissions: ['production:read'] },
  mfgyield: { permissions: ['production:read', 'bi:view'], anyOf: true },
  reworkorders: { permissions: ['production:read'] },
  disposalcenter: { permissions: ['production:read'] },
  wastecost: { permissions: ['costing:read'] },
  sustainability: { permissions: ['bi:view', 'audit:read'], anyOf: true },
  foodloss: { permissions: ['production:read', 'bi:view'], anyOf: true },

  // ─── Scheduling ───────────────────────────────────────────────────────
  schedulingdashboard: { permissions: ['production:read', 'bi:view'], anyOf: true },
  machineschedule: { permissions: ['production:read', 'eam:read'], anyOf: true },
  shiftplanner: { permissions: ['hr:view', 'production:read'], anyOf: true },
  campaignplanner: { permissions: ['production:read'] },
  constraintcenter: { permissions: ['production:read'] },
  simulationconsole: { permissions: ['production:read'] },
  productioncalendar: { permissions: ['production:read'] },
  capacityheatmap: { permissions: ['production:read', 'bi:view'], anyOf: true },

  // ─── Mission Control (Mfg) ────────────────────────────────────────────
  mfgmissioncontrol: { permissions: ['bi:view', 'missioncontrol:read'], anyOf: true },
  mfgcontroltower: { permissions: ['bi:view', 'controltower:read'], anyOf: true },
  digitalfactory: { permissions: ['bi:view'] },
  mfgalertcenter: { permissions: ['alerts:read'] },
  mfgfactoryhealth: { permissions: ['bi:view', 'eam:read'], anyOf: true },
  mfgscorecard: { permissions: ['bi:view'] },
  mfgexecdashboard: { permissions: ['bi:view'] },
  mfgbizcontinuity: { permissions: ['bi:view', 'system:settings'], anyOf: true },

  // ─── AI Smart Factory ─────────────────────────────────────────────────
  aismartfactory: { permissions: ['bi:view'] },
  airecommendations: { permissions: ['bi:view'] },
  aipredictivemaint: { permissions: ['eam:read', 'bi:view'], anyOf: true },
  aipredictivequality: { permissions: ['quality:view', 'bi:view'], anyOf: true },
  airecipeopt: { permissions: ['recipe:read', 'bi:view'], anyOf: true },
  aienergy: { permissions: ['bi:view'] },
  airootcause: { permissions: ['bi:view', 'alerts:read'], anyOf: true },
  aicontinuous: { permissions: ['bi:view'] },

  // ─── Quality Foundation ───────────────────────────────────────────────
  qmsdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  qmsstandards: { permissions: ['quality:read'] },
  qmsinspection: { permissions: ['quality:inspect', 'quality:read'], anyOf: true },
  qmsspecs: { permissions: ['quality:read'] },
  qmssampling: { permissions: ['quality:read'] },
  qmstestmethods: { permissions: ['quality:read'] },
  qmscalendar: { permissions: ['quality:read'] },
  qmsdepts: { permissions: ['quality:read', 'org:view'], anyOf: true },

  // ─── Supplier Quality (IQC) ───────────────────────────────────────────
  iqcdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  iqcsuppliers: { permissions: ['quality:read', 'supplier:view'], anyOf: true },
  iqcqueue: { permissions: ['quality:inspect', 'quality:read'], anyOf: true },
  iqchold: { permissions: ['quality:hold', 'quality:read'], anyOf: true },
  iqcncr: { permissions: ['ncr:read', 'quality:read'], anyOf: true },
  iqcscorecard: { permissions: ['quality:read', 'bi:view'], anyOf: true },

  // ─── IPQC ─────────────────────────────────────────────────────────────
  ipqcdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  ipqccheckpoints: { permissions: ['quality:inspect', 'quality:read'], anyOf: true },
  ipqcccp: { permissions: ['quality:read'] },
  ipqcbatch: { permissions: ['quality:inspect', 'batch:view'], anyOf: true },
  ipqcholds: { permissions: ['quality:hold', 'quality:read'], anyOf: true },
  ipqcalerts: { permissions: ['alerts:read', 'quality:read'], anyOf: true },

  // ─── FGQC ─────────────────────────────────────────────────────────────
  fgqcdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  fgqcinspection: { permissions: ['quality:inspect', 'quality:read'], anyOf: true },
  fgqcrelease: { permissions: ['quality:approve', 'quality:read'], anyOf: true },
  fgqcshelflife: { permissions: ['quality:read', 'batch:view'], anyOf: true },
  fgqccertificates: { permissions: ['coa:read', 'coa:sign'], anyOf: true },

  // ─── LIMS ─────────────────────────────────────────────────────────────
  limsdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  limssamples: { permissions: ['quality:read'] },
  limsworklist: { permissions: ['quality:read'] },
  limsequipment: { permissions: ['quality:read', 'eam:read'], anyOf: true },
  limsinventory: { permissions: ['quality:read', 'inventory:view'], anyOf: true },

  // ─── Food Safety ──────────────────────────────────────────────────────
  fsdashboard: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  fshaccp: { permissions: ['quality:read'] },
  fsccp: { permissions: ['quality:read'] },
  fsenvironmental: { permissions: ['quality:read'] },
  fsallergen: { permissions: ['quality:read', 'catalog:read'], anyOf: true },

  // ─── NCR ──────────────────────────────────────────────────────────────
  ncrdashboard: { permissions: ['ncr:read', 'quality:view'], anyOf: true },
  ncrdeviation: { permissions: ['ncr:read', 'ncr:create'], anyOf: true },
  ncrquarantine: { permissions: ['ncr:read', 'quality:hold'], anyOf: true },
  ncrinvestigation: { permissions: ['ncr:read', 'ncr:approve'], anyOf: true },

  // ─── CAPA ─────────────────────────────────────────────────────────────
  capadashboard: { permissions: ['capa:read', 'quality:view'], anyOf: true },
  correctiveactions: { permissions: ['capa:read', 'capa:create'], anyOf: true },
  preventiveactions: { permissions: ['capa:read', 'capa:create'], anyOf: true },
  effectivenessreview: { permissions: ['capa:read', 'capa:approve'], anyOf: true },
  continuousimprovement: { permissions: ['capa:read', 'bi:view'], anyOf: true },

  // ─── COA & Compliance ─────────────────────────────────────────────────
  coadashboard: { permissions: ['coa:read', 'quality:view'], anyOf: true },
  coagenerator: { permissions: ['coa:read', 'coa:sign'], anyOf: true },
  compliancedocs: { permissions: ['coa:read', 'audit:read'], anyOf: true },
  regulatorycompliance: { permissions: ['coa:read', 'audit:read'], anyOf: true },
  coacompliancedashboard: { permissions: ['coa:read', 'bi:view'], anyOf: true },

  // ─── Disabled placeholders ────────────────────────────────────────────
  manufacturing: { permissions: ['production:read'] },
  quality: { permissions: ['quality:view', 'quality:read'], anyOf: true },
  procurement: { permissions: ['po:view', 'pr:view'], anyOf: true },
  finance: { permissions: ['finance:read', 'gl:view'], anyOf: true },
  hr: { permissions: ['hr:view', 'hr:read'], anyOf: true },
  maintenance: { permissions: ['eam:read', 'eam:maintenance'], anyOf: true },
  retail: { permissions: ['bi:view'] },
  restaurant: { permissions: ['bi:view'] },
  ai: { permissions: ['bi:view'] },
}

/**
 * Check if the user has access to a module.
 * Returns true if:
 *   - Demo mode is on
 *   - User has SUPER_ADMIN role
 *   - User has the required permission(s) for the module
 *   - Module has no permission requirement (e.g., dashboard)
 */
export function hasModuleAccess(
  moduleKey: ModuleKey,
  hasPermission: (perm: string) => boolean,
  options: { isDemoMode?: boolean; isSuperAdmin?: boolean } = {}
): boolean {
  if (options.isDemoMode) return true
  if (options.isSuperAdmin) return true

  const config = MODULE_PERMISSIONS[moduleKey]
  if (!config) {
    // Unknown module — default to requiring org:view (conservative)
    return hasPermission('org:view')
  }
  if (config.permissions.length === 0) return true // any authenticated user

  if (config.anyOf) {
    return config.permissions.some(p => hasPermission(p))
  }
  return config.permissions.every(p => hasPermission(p))
}
