// Backward compat shim — all clients moved to @/api
export { costingApi } from '@/api/finance'
export { fulfillmentApi } from '@/api/sales'
export { pickPackApi, pickPackDispatchApi } from '@/api/sales'
export { deliveryApi } from '@/api/sales'
export { attendanceApi as workforceApi } from '@/api/hr'
export { salesOrderApi } from '@/api/sales'
export { batchApi as batchMfgApi } from '@/api/manufacturing'
