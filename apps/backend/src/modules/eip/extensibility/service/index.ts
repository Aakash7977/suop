/**
 * @suop/backend — Extensibility Platform (Phase 65)
 *
 * Low-code/no-code extensibility platform:
 *   - Plugin SDK (third-party extensions)
 *   - Extension SDK (UI extensions)
 *   - Workflow Builder (visual workflow designer)
 *   - Form Builder (dynamic forms)
 *   - Dashboard Builder (custom dashboards)
 *   - Business Rule Builder (no-code rules engine)
 *   - Automation Builder (trigger-action automation)
 *   - Marketplace (extension marketplace)
 */

import { logger } from '@/core/logging'
import { randomUUID } from 'node:crypto'
// db import removed (not used)

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  tenantId: string | null // null = global plugin
  entryPoint: string // module path or URL
  permissions: string[]
  isActive: boolean
  installedAt: Date
  config: Record<string, unknown>
}

export interface Extension {
  id: string
  pluginId: string
  type: 'ui' | 'api' | 'workflow' | 'form' | 'dashboard'
  name: string
  target: string // where the extension appears (e.g., 'product.detail.tab')
  config: Record<string, unknown>
  isActive: boolean
}

export interface CustomWorkflow {
  id: string
  name: string
  tenantId: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  isActive: boolean
  createdAt: Date
  version: number
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual' | 'webhook'
  config: Record<string, unknown>
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'action' | 'condition' | 'delay' | 'parallel' | 'loop'
  config: Record<string, unknown>
  nextStepId?: string
}

export interface CustomForm {
  id: string
  name: string
  tenantId: string
  entityType: string
  fields: FormField[]
  layout: 'single' | 'two-column' | 'wizard'
  isActive: boolean
  version: number
}

export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'reference'
  required: boolean
  defaultValue?: unknown
  options?: Array<{ label: string; value: string }>
  validation?: Record<string, unknown>
  conditional?: { field: string; operator: string; value: unknown }
}

export interface CustomDashboard {
  id: string
  name: string
  tenantId: string
  widgets: DashboardWidget[]
  layout: { columns: number; rows: number }
  isShared: boolean
  createdBy: string
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'heatmap' | 'timeline' | 'custom'
  title: string
  dataSource: string // query or API endpoint
  config: Record<string, unknown>
  position: { x: number; y: number; width: number; height: number }
}

export interface BusinessRule {
  id: string
  name: string
  tenantId: string
  entityType: string
  trigger: 'before_save' | 'after_save' | 'before_delete' | 'after_delete' | 'on_transition'
  conditions: RuleCondition[]
  actions: RuleAction[]
  isActive: boolean
  priority: number
}

export interface RuleCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with'
  value: unknown
}

export interface RuleAction {
  type: 'set_field' | 'send_notification' | 'call_webhook' | 'create_record' | 'update_record' | 'transition_state'
  config: Record<string, unknown>
}

export interface Automation {
  id: string
  name: string
  tenantId: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
  isActive: boolean
  runCount: number
  lastRunAt: Date | null
}

export interface AutomationTrigger {
  type: 'event' | 'schedule' | 'condition' | 'manual'
  config: Record<string, unknown>
}

export interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'send_notification' | 'create_record' | 'update_record' | 'call_connector' | 'delay' | 'if_condition'
  config: Record<string, unknown>
}

// ─── Plugin Registry ────────────────────────────────────────────────────────

const _plugins = new Map<string, Plugin>()

export function installPlugin(plugin: Omit<Plugin, 'id' | 'installedAt'>): Plugin {
  const id = randomUUID()
  const fullPlugin: Plugin = { ...plugin, id, installedAt: new Date() }
  _plugins.set(id, fullPlugin)
  logger.info('Plugin installed', { id, name: plugin.name, version: plugin.version })
  return fullPlugin
}

export function uninstallPlugin(pluginId: string): boolean {
  const plugin = _plugins.get(pluginId)
  if (!plugin) return false
  _plugins.delete(pluginId)
  logger.info('Plugin uninstalled', { pluginId, name: plugin.name })
  return true
}

export function listPlugins(tenantId?: string): Plugin[] {
  const plugins = Array.from(_plugins.values())
  if (tenantId) {
    return plugins.filter((p) => p.tenantId === tenantId || p.tenantId === null)
  }
  return plugins
}

export function getPlugin(pluginId: string): Plugin | null {
  return _plugins.get(pluginId) ?? null
}

// ─── Workflow Builder ───────────────────────────────────────────────────────

const _workflows = new Map<string, CustomWorkflow>()

export function createCustomWorkflow(params: Omit<CustomWorkflow, 'id' | 'createdAt' | 'version'>): CustomWorkflow {
  const id = randomUUID()
  const workflow: CustomWorkflow = {
    ...params,
    id,
    createdAt: new Date(),
    version: 1,
  }
  _workflows.set(id, workflow)
  logger.info('Custom workflow created', { id, name: params.name })
  return workflow
}

export function listCustomWorkflows(tenantId: string): CustomWorkflow[] {
  return Array.from(_workflows.values()).filter((w) => w.tenantId === tenantId)
}

export function executeCustomWorkflow(workflowId: string, data: Record<string, unknown>): Promise<{ success: boolean; results: Record<string, unknown> }> {
  void data
  return new Promise((resolve) => {
    const workflow = _workflows.get(workflowId)
    if (!workflow) {
      resolve({ success: false, results: { error: 'Workflow not found' } })
      return
    }

    logger.info('Custom workflow executed', { workflowId, name: workflow.name })

    // In production, this would execute each step in sequence
    // with proper error handling, conditions, and parallel execution
    resolve({ success: true, results: { steps: workflow.steps.length } })
  })
}

// ─── Form Builder ───────────────────────────────────────────────────────────

const _forms = new Map<string, CustomForm>()

export function createCustomForm(params: Omit<CustomForm, 'id' | 'version'>): CustomForm {
  const id = randomUUID()
  const form: CustomForm = { ...params, id, version: 1 }
  _forms.set(id, form)
  logger.info('Custom form created', { id, name: params.name })
  return form
}

export function listCustomForms(tenantId: string, entityType?: string): CustomForm[] {
  let forms = Array.from(_forms.values()).filter((f) => f.tenantId === tenantId)
  if (entityType) {
    forms = forms.filter((f) => f.entityType === entityType)
  }
  return forms
}

export function getCustomForm(formId: string): CustomForm | null {
  return _forms.get(formId) ?? null
}

// ─── Dashboard Builder ──────────────────────────────────────────────────────

const _dashboards = new Map<string, CustomDashboard>()

export function createCustomDashboard(params: Omit<CustomDashboard, 'id'>): CustomDashboard {
  const id = randomUUID()
  const dashboard: CustomDashboard = { ...params, id }
  _dashboards.set(id, dashboard)
  logger.info('Custom dashboard created', { id, name: params.name })
  return dashboard
}

export function listCustomDashboards(tenantId: string): CustomDashboard[] {
  return Array.from(_dashboards.values()).filter((d) => d.tenantId === tenantId || d.isShared)
}

// ─── Business Rule Engine ───────────────────────────────────────────────────

const _rules = new Map<string, BusinessRule>()

export function createBusinessRule(params: Omit<BusinessRule, 'id'>): BusinessRule {
  const id = randomUUID()
  const rule: BusinessRule = { ...params, id }
  _rules.set(id, rule)
  logger.info('Business rule created', { id, name: params.name, entityType: params.entityType })
  return rule
}

export function listBusinessRules(tenantId: string, entityType?: string): BusinessRule[] {
  let rules = Array.from(_rules.values()).filter((r) => r.tenantId === tenantId)
  if (entityType) {
    rules = rules.filter((r) => r.entityType === entityType)
  }
  return rules.sort((a, b) => b.priority - a.priority)
}

/**
 * Evaluate business rules against a record.
 */
export function evaluateRules(params: {
  tenantId: string
  entityType: string
  trigger: BusinessRule['trigger']
  record: Record<string, unknown>
}): Array<{ rule: BusinessRule; actions: RuleAction[] }> {
  const rules = listBusinessRules(params.tenantId, params.entityType)
    .filter((r) => r.isActive && r.trigger === params.trigger)

  const matching: Array<{ rule: BusinessRule; actions: RuleAction[] }> = []

  for (const rule of rules) {
    const allConditionsMet = rule.conditions.every((cond) => {
      const value = params.record[cond.field]
      switch (cond.operator) {
        case 'eq': return value === cond.value
        case 'neq': return value !== cond.value
        case 'gt': return Number(value) > Number(cond.value)
        case 'lt': return Number(value) < Number(cond.value)
        case 'gte': return Number(value) >= Number(cond.value)
        case 'lte': return Number(value) <= Number(cond.value)
        case 'in': return Array.isArray(cond.value) && cond.value.includes(value)
        case 'not_in': return Array.isArray(cond.value) && !cond.value.includes(value)
        case 'contains': return String(value).includes(String(cond.value))
        case 'starts_with': return String(value).startsWith(String(cond.value))
        case 'ends_with': return String(value).endsWith(String(cond.value))
        default: return false
      }
    })

    if (allConditionsMet) {
      matching.push({ rule, actions: rule.actions })
    }
  }

  return matching
}

// ─── Automation Builder ─────────────────────────────────────────────────────

const _automations = new Map<string, Automation>()

export function createAutomation(params: Omit<Automation, 'id' | 'runCount' | 'lastRunAt'>): Automation {
  const id = randomUUID()
  const automation: Automation = {
    ...params,
    id,
    runCount: 0,
    lastRunAt: null,
  }
  _automations.set(id, automation)
  logger.info('Automation created', { id, name: params.name })
  return automation
}

export function listAutomations(tenantId: string): Automation[] {
  return Array.from(_automations.values()).filter((a) => a.tenantId === tenantId)
}

/**
 * Execute an automation.
 */
export async function executeAutomation(automationId: string, context: Record<string, unknown>): Promise<{ success: boolean }> {
  void context
  const automation = _automations.get(automationId)
  if (!automation || !automation.isActive) {
    return { success: false }
  }

  logger.info('Automation executing', { automationId, name: automation.name })

  // In production, this would execute each action in sequence
  // with proper error handling and context passing
  automation.runCount++
  automation.lastRunAt = new Date()

  return { success: true }
}

// ─── Marketplace ────────────────────────────────────────────────────────────

export interface MarketplacePlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: 'integration' | 'automation' | 'reporting' | 'ui' | 'industry'
  downloads: number
  rating: number
  price: number // 0 = free
  screenshots: string[]
  documentationUrl: string
  publishedAt: Date
}

const _marketplace: MarketplacePlugin[] = []

export function listMarketplacePlugins(category?: string): MarketplacePlugin[] {
  if (category) {
    return _marketplace.filter((p) => p.category === category)
  }
  return _marketplace
}

export function publishToMarketplace(plugin: Omit<MarketplacePlugin, 'id' | 'downloads' | 'rating' | 'publishedAt'>): MarketplacePlugin {
  const id = randomUUID()
  const marketplacePlugin: MarketplacePlugin = {
    ...plugin,
    id,
    downloads: 0,
    rating: 0,
    publishedAt: new Date(),
  }
  _marketplace.push(marketplacePlugin)
  logger.info('Plugin published to marketplace', { id, name: plugin.name })
  return marketplacePlugin
}
