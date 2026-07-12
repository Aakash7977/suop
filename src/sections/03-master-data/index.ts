/**
 * Section 03 — Master Data Management
 * Public API barrel
 *
 * Re-exports all 9 master data components. page.tsx imports from here
 * instead of defining them inline.
 *
 * Modules:
 * 1. ProductMasterModule    — Product Master CRUD + lifecycle + search + pagination
 * 2. PIMModule              — Product Information Management (categories, compliance, approvals)
 * 3. CommercialEngineModule — Price Lists, Tax, Discounts, Promotions, Approvals, Cost, Rules, Resolution
 * 4. BusinessPartnerModule  — Customer + Supplier unified platform (10 sub-tabs)
 * 5. IdentificationModule   — Barcodes, QR, Batches, Lots, Serials, GS1, Labels, Print, Traceability
 * 6. GovernanceModule       — Lifecycle, Approvals, Import, Export, Validation, Duplicates, Audit, Quality, History
 * 7. WarehouseModule        — Warehouse Master, Zones, Temperature Zones, Rules
 * 8. WarehouseLocationModule — Storage Bins, Aisles, Racks, Capacity
 * 9. PlantMasterModule      — Manufacturing Plant Master
 *
 * Note: OrganizationModule (Company/BU/Division/Region) is Section 01 and
 * remains in page.tsx untouched.
 */

export { ProductMasterModule } from './components/product-master'
export { PIMModule } from './components/pim'
export { CommercialEngineModule } from './components/commercial-engine'
export { BusinessPartnerModule } from './components/business-partner'
export { IdentificationModule } from './components/identification'
export { GovernanceModule } from './components/governance'
export { WarehouseModule } from './components/warehouse'
export { WarehouseLocationModule } from './components/warehouse-locations'
export { PlantMasterModule } from './components/plant-master'

// Re-export shared utilities and types
export * from './api/clients'
export * from './hooks/use-master-data'
export * from './constants/master-data'
export * from './utils/helpers'
