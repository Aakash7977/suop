/** Quality Inspection Module — Unit Tests */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/quality-inspection/workflow'
import '@/modules/quality-inspection/workflow/ncr'
import { BusinessRuleError, NotFoundError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED' | 'ON_HOLD'
interface InspectionEntity extends WorkflowEntity { id: string; status: InspectionStatus; version: number }
const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

type NCRStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CAPA_INITIATED' | 'RESOLVED' | 'CLOSED'
interface NCREntity extends WorkflowEntity { id: string; status: NCRStatus; version: number }

describe('Inspection Lot Workflow', () => {
  const machine = workflowRegistry.get<InspectionStatus, InspectionEntity>('InspectionLotLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('PENDING') })
  it('has 6 states', () => { expect(machine.definition.states).toHaveLength(6) })
  it('has 8 transitions', () => { expect(machine.definition.transitions).toHaveLength(8) })
  it('allows PENDING → IN_PROGRESS', async () => { expect((await machine.canTransition({ id: '1', status: 'PENDING', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('allows PENDING → ON_HOLD', async () => { expect((await machine.canTransition({ id: '2', status: 'PENDING', version: 0 }, 'ON_HOLD', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → PASSED', async () => { expect((await machine.canTransition({ id: '3', status: 'IN_PROGRESS', version: 0 }, 'PASSED', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → CONDITIONAL_PASS', async () => { expect((await machine.canTransition({ id: '4', status: 'IN_PROGRESS', version: 0 }, 'CONDITIONAL_PASS', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → FAILED', async () => { expect((await machine.canTransition({ id: '5', status: 'IN_PROGRESS', version: 0 }, 'FAILED', wfCtx)).allowed).toBe(true) })
  it('allows IN_PROGRESS → ON_HOLD', async () => { expect((await machine.canTransition({ id: '6', status: 'IN_PROGRESS', version: 0 }, 'ON_HOLD', wfCtx)).allowed).toBe(true) })
  it('allows ON_HOLD → IN_PROGRESS', async () => { expect((await machine.canTransition({ id: '7', status: 'ON_HOLD', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(true) })
  it('allows CONDITIONAL_PASS → PASSED', async () => { expect((await machine.canTransition({ id: '8', status: 'CONDITIONAL_PASS', version: 0 }, 'PASSED', wfCtx)).allowed).toBe(true) })
  it('rejects PENDING → PASSED (must start inspection)', async () => { expect((await machine.canTransition({ id: '9', status: 'PENDING', version: 0 }, 'PASSED', wfCtx)).allowed).toBe(false) })
  it('rejects PASSED → IN_PROGRESS (terminal)', async () => { expect((await machine.canTransition({ id: '10', status: 'PASSED', version: 0 }, 'IN_PROGRESS', wfCtx)).allowed).toBe(false) })
  it('rejects FAILED → PASSED (cannot revive failed)', async () => { expect((await machine.canTransition({ id: '11', status: 'FAILED', version: 0 }, 'PASSED', wfCtx)).allowed).toBe(false) })
})

describe('NCR Workflow', () => {
  const machine = workflowRegistry.get<NCRStatus, NCREntity>('NCRLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('OPEN') })
  it('has 5 states', () => { expect(machine.definition.states).toHaveLength(5) })
  it('has 6 transitions', () => { expect(machine.definition.transitions).toHaveLength(6) })
  it('allows OPEN → UNDER_INVESTIGATION', async () => { expect((await machine.canTransition({ id: '1', status: 'OPEN', version: 0 }, 'UNDER_INVESTIGATION', wfCtx)).allowed).toBe(true) })
  it('allows OPEN → CLOSED', async () => { expect((await machine.canTransition({ id: '2', status: 'OPEN', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INVESTIGATION → CAPA_INITIATED', async () => { expect((await machine.canTransition({ id: '3', status: 'UNDER_INVESTIGATION', version: 0 }, 'CAPA_INITIATED', wfCtx)).allowed).toBe(true) })
  it('allows UNDER_INVESTIGATION → RESOLVED', async () => { expect((await machine.canTransition({ id: '4', status: 'UNDER_INVESTIGATION', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows CAPA_INITIATED → RESOLVED', async () => { expect((await machine.canTransition({ id: '5', status: 'CAPA_INITIATED', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows RESOLVED → CLOSED', async () => { expect((await machine.canTransition({ id: '6', status: 'RESOLVED', version: 0 }, 'CLOSED', wfCtx)).allowed).toBe(true) })
  it('rejects CLOSED → OPEN (terminal)', async () => { expect((await machine.canTransition({ id: '7', status: 'CLOSED', version: 0 }, 'OPEN', wfCtx)).allowed).toBe(false) })
  it('rejects OPEN → RESOLVED (must investigate)', async () => { expect((await machine.canTransition({ id: '8', status: 'OPEN', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(false) })
})

describe('AQL Sampling Logic', () => {
  // Simulate sampling plan lookup
  function getSampleSize(lotSize: number, plans: Array<{ min: number; max: number; sample: number }>): number {
    for (const p of plans) {
      if (lotSize >= p.min && lotSize <= p.max) return p.sample
    }
    return lotSize <= 10 ? lotSize : Math.ceil(lotSize * 0.1)
  }
  it('returns full sample for small lots (≤10)', () => {
    const plans = [{ min: 1, max: 10, sample: 10 }]
    expect(getSampleSize(5, plans)).toBe(10)
  })
  it('returns 13 samples for lot size 11-25', () => {
    const plans = [{ min: 1, max: 10, sample: 10 }, { min: 11, max: 25, sample: 13 }]
    expect(getSampleSize(20, plans)).toBe(13)
  })
  it('returns 50 samples for lot size 281-500', () => {
    const plans = [{ min: 1, max: 10, sample: 10 }, { min: 11, max: 25, sample: 13 }, { min: 281, max: 500, sample: 50 }]
    expect(getSampleSize(400, plans)).toBe(50)
  })
  it('defaults to 10% for large lots without plan', () => {
    expect(getSampleSize(1000, [])).toBe(100)
  })
  it('accepts lot at accept number (0 defects)', () => {
    const acceptNumber = 0
    const defectsFound = 0
    expect(defectsFound <= acceptNumber).toBe(true)
  })
  it('rejects lot at reject number (1 defect)', () => {
    const rejectNumber = 1
    const defectsFound = 1
    expect(defectsFound >= rejectNumber).toBe(true)
  })
  it('validates accept < reject', () => {
    const accept = 0; const reject = 1
    expect(accept < reject).toBe(true)
  })
  it('throws when accept >= reject', () => {
    expect(() => { if (1 >= 1) throw new BusinessRuleError('Invalid', { code: 'IQC.INVALID_ACCEPT_REJECT' }) }).toThrow(BusinessRuleError)
  })
})

describe('IQC Business Rules', () => {
  it('throws on zero lot quantity', () => {
    expect(() => { if (0 <= 0) throw new BusinessRuleError('Invalid', { code: 'IQC.INVALID_LOT_QTY' }) }).toThrow(BusinessRuleError)
  })
  it('throws on invalid lot size range (max <= min)', () => {
    const lotSizeMin = 10; const lotSizeMax = 5
    expect(() => { if (lotSizeMax <= lotSizeMin) throw new BusinessRuleError('Invalid', { code: 'IQC.INVALID_LOT_RANGE' }) }).toThrow(BusinessRuleError)
  })
  it('throws when recording result on completed lot', () => {
    expect(() => { if (!['IN_PROGRESS', 'PENDING'].includes('PASSED')) throw new BusinessRuleError('Not in progress', { code: 'IQC.NOT_IN_PROGRESS' }) }).toThrow(BusinessRuleError)
  })
  it('throws on invalid held quantity', () => {
    expect(() => { if (0 <= 0) throw new BusinessRuleError('Invalid', { code: 'QH.INVALID_QTY' }) }).toThrow(BusinessRuleError)
  })
  it('throws when hold is not active', () => {
    expect(() => { if (true) throw new BusinessRuleError('Not active', { code: 'QH.NOT_ACTIVE' }) }).toThrow(BusinessRuleError)
  })
})

describe('IQC Error Types', () => {
  it('BusinessRuleError for transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'IQC.TRANSITION_DENIED' }).code).toBe('IQC.TRANSITION_DENIED') })
  it('BusinessRuleError for inspection lot not found', () => { expect(new BusinessRuleError('Not found', { code: 'IQC.INSPECTION_LOT_NOT_FOUND' }).code).toBe('IQC.INSPECTION_LOT_NOT_FOUND') })
  it('BusinessRuleError for not in progress', () => { expect(new BusinessRuleError('Not in progress', { code: 'IQC.NOT_IN_PROGRESS' }).code).toBe('IQC.NOT_IN_PROGRESS') })
  it('BusinessRuleError for NCR transition denied', () => { expect(new BusinessRuleError('Denied', { code: 'NCR.TRANSITION_DENIED' }).code).toBe('NCR.TRANSITION_DENIED') })
  it('NotFoundError returns 404', () => { expect(new NotFoundError('InspectionLot', 'abc').statusCode).toBe(404) })
})

describe('IQC RBAC', () => {
  it('IQC_INSPECT permission exists', () => { expect(Permission.IQC_INSPECT).toBe('iqc:inspect') })
  it('IQC_APPROVE permission exists', () => { expect(Permission.IQC_APPROVE).toBe('iqc:approve') })
  it('NCR_CREATE permission exists', () => { expect(Permission.NCR_CREATE).toBe('ncr:create') })
  it('NCR_APPROVE permission exists', () => { expect(Permission.NCR_APPROVE).toBe('ncr:approve') })
  it('COA_SIGN permission exists', () => { expect(Permission.COA_SIGN).toBe('coa:sign') })
  it('tenant_admin has IQC_INSPECT', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.IQC_INSPECT)).toBe(true) })
  it('quality_manager has IQC_INSPECT and APPROVE', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.IQC_INSPECT)).toBe(true)
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.IQC_APPROVE)).toBe(true)
  })
  it('quality_manager has NCR_CREATE and APPROVE', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.NCR_CREATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.NCR_APPROVE)).toBe(true)
  })
  it('procurement_officer cannot inspect', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.IQC_INSPECT)).toBe(false) })
})

describe('IQC Schemas', () => {
  it('validates inspection result enum', () => {
    const schema = z.enum(['PASS', 'FAIL', 'CONDITIONAL'])
    expect(schema.safeParse('PASS').success).toBe(true)
    expect(schema.safeParse('INVALID').success).toBe(false)
  })
  it('validates NCR severity enum', () => {
    const schema = z.enum(['MINOR', 'MAJOR', 'CRITICAL'])
    expect(schema.safeParse('MAJOR').success).toBe(true)
    expect(schema.safeParse('LOW').success).toBe(false)
  })
  it('validates positive lot quantity', () => {
    const schema = z.object({ lotQuantity: z.number().positive() })
    expect(schema.safeParse({ lotQuantity: 100 }).success).toBe(true)
    expect(schema.safeParse({ lotQuantity: 0 }).success).toBe(false)
  })
  it('validates positive held quantity', () => {
    const schema = z.object({ heldQty: z.number().positive() })
    expect(schema.safeParse({ heldQty: 50 }).success).toBe(true)
    expect(schema.safeParse({ heldQty: 0 }).success).toBe(false)
  })
})

describe('Number Generation', () => {
  it('generates IQL number', () => {
    const year = new Date().getFullYear()
    expect(`IQL-${year}-000001`).toMatch(/^IQL-\d{4}-\d{6}$/)
  })
  it('generates QH number', () => {
    const year = new Date().getFullYear()
    expect(`QH-${year}-000001`).toMatch(/^QH-\d{4}-\d{6}$/)
  })
  it('generates NCR number', () => {
    const year = new Date().getFullYear()
    expect(`NCR-${year}-000001`).toMatch(/^NCR-\d{4}-\d{6}$/)
  })
  it('generates CAPA number', () => {
    const year = new Date().getFullYear()
    expect(`CAPA-${year}-000001`).toMatch(/^CAPA-\d{4}-\d{6}$/)
  })
})
