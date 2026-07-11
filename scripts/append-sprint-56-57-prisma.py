#!/usr/bin/env python3
"""
Append Sprint 56 (CAPA + Continuous Improvement) and
Sprint 57 (COA + Compliance + Certificates) Prisma models
to /home/z/my-project/prisma/schema.prisma
"""

SCHEMA_PATH = "/home/z/my-project/prisma/schema.prisma"

SPRINT_56_57_MODELS = r"""
// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 56 — ENTERPRISE CAPA (CORRECTIVE & PREVENTIVE ACTIONS)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Epic 1: CAPA Master ─────────────────────────────────────────────────
model CapaRecord {
  id                  String   @id @default(uuid()) @db.Uuid
  capaNumber          String   @unique @map("capa_number") // CAPA-2026-000001
  // ─── Source Linkage ───
  sourceType          String   @default("NCR") @map("source_type") // NCR, DEVIATION, COMPLAINT, AUDIT, INTERNAL, MANAGEMENT_REVIEW
  sourceNcrId         String?  @db.Uuid @map("source_ncr_id")
  sourceNcrNumber     String?  @map("source_ncr_number")
  sourceReference     String?  @map("source_reference") // for non-NCR sources
  // ─── Organization ───
  department          String   @map("department") // QUALITY, PRODUCTION, MAINTENANCE, WAREHOUSE, PROCUREMENT, ENGINEERING, HR, FOOD_SAFETY
  plant               String?  @map("plant")
  location            String?  @map("location")
  // ─── Classification ───
  capaType            String   @default("CORRECTIVE") @map("capa_type") // CORRECTIVE, PREVENTIVE, BOTH
  priority            String   @default("MEDIUM") @map("priority") // LOW, MEDIUM, HIGH, CRITICAL
  riskLevel           String   @default("MODERATE") @map("risk_level") // LOW, MODERATE, HIGH, CATASTROPHIC
  riskScore           Int?     @map("risk_score") // 1-100 RPN
  // ─── Problem Statement ───
  title               String   @map("title")
  problemStatement    String   @map("problem_statement")
  rootCause           String?  @map("root_cause")
  analysisMethod      String?  @map("analysis_method") // 5_WHYS, FISHBONE, FAULT_TREE, PARETO, TIMELINE
  // ─── Assignment ───
  ownerId             String?  @db.Uuid @map("owner_id")
  ownerName           String?  @map("owner_name")
  assignedDepartment  String?  @map("assigned_department")
  assignedToRole      String?  @map("assigned_to_role")
  // ─── Schedule ───
  dueDate             DateTime? @map("due_date")
  assignedAt          DateTime? @map("assigned_at")
  startedAt           DateTime? @map("started_at")
  completedAt         DateTime? @map("completed_at")
  closedAt            DateTime? @map("closed_at")
  // ─── Effectiveness ───
  effectivenessStatus String?  @map("effectiveness_status") // PENDING, IN_PROGRESS, EFFECTIVE, INEFFECTIVE
  effectivenessVerifiedAt DateTime? @map("effectiveness_verified_at")
  effectivenessVerifiedBy String?  @map("effectiveness_verified_by")
  effectivenessResult String?  @map("effectiveness_result")
  // ─── Status ───
  status              String   @default("DRAFT") @map("status") // DRAFT, OPEN, ASSIGNED, IN_PROGRESS, AWAITING_VERIFICATION, CLOSED, CANCELLED
  cancellationReason  String?  @map("cancellation_reason")
  // ─── Cost Impact ───
  estimatedCost       Decimal? @db.Decimal(14, 2) @map("estimated_cost")
  actualCost          Decimal? @db.Decimal(14, 2) @map("actual_cost")
  costSaved           Decimal? @db.Decimal(14, 2) @map("cost_saved")
  // ─── Audit ───
  createdBy           String?  @map("created_by")
  updatedBy           String?  @map("updated_by")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  actions             CapaAction[]
  tasks               CapaTask[]
  verifications       CapaEffectivenessVerification[]
  escalations         CapaEscalation[]

  @@map("capa_records")
  @@index([sourceNcrNumber], map: "idx_capa56_ncr")
  @@index([status, priority], map: "idx_capa56_status_pri")
  @@index([department, status], map: "idx_capa56_dept_status")
  @@index([dueDate], map: "idx_capa56_due")
}

// ─── Epic 2 & 3: Corrective + Preventive Actions ────────────────────────
model CapaAction {
  id                  String   @id @default(uuid()) @db.Uuid
  capaId              String   @db.Uuid @map("capa_id")
  capaNumber          String   @map("capa_number")
  // ─── Action Type ───
  actionType          String   @map("action_type") // CORRECTIVE, PREVENTIVE
  actionCategory      String   @map("action_category")
  // CORRECTIVE categories: MACHINE_REPAIR, OPERATOR_RETRAINING, RECIPE_CORRECTION, SUPPLIER_REPLACEMENT, PACKAGING_CHANGE, CLEANING_REVISION, SPECIFICATION_UPDATE, EQUIPMENT_CALIBRATION
  // PREVENTIVE categories: NEW_SOP, TRAINING, ADDITIONAL_INSPECTION, MACHINE_UPGRADE, SUPPLIER_AUDIT, RECIPE_VALIDATION, AUTOMATION, QUALITY_GATE
  // ─── Action Details ───
  actionTitle         String   @map("action_title")
  actionDescription   String   @map("action_description")
  // ─── Responsible ───
  responsiblePerson   String?  @map("responsible_person")
  responsibleRole     String?  @map("responsible_role")
  department          String?  @map("department")
  // ─── Schedule ───
  plannedStartDate    DateTime? @map("planned_start_date")
  plannedEndDate      DateTime? @map("planned_end_date")
  actualStartDate     DateTime? @map("actual_start_date")
  actualEndDate       DateTime? @map("actual_end_date")
  // ─── Evidence ───
  evidenceRequired    Boolean  @default(true) @map("evidence_required")
  evidenceUrl         String?  @map("evidence_url") // JSON array of file URLs
  evidenceNotes       String?  @map("evidence_notes")
  // ─── Verification ───
  verifiedBy          String?  @map("verified_by")
  verifiedAt          DateTime? @map("verified_at")
  verificationResult  String?  @map("verification_result") // PENDING, APPROVED, REJECTED
  verificationNotes   String?  @map("verification_notes")
  // ─── Completion ───
  completionPercent   Int      @default(0) @map("completion_percent") // 0-100
  completionNotes     String?  @map("completion_notes")
  // ─── Status ───
  status              String   @default("OPEN") @map("status") // OPEN, IN_PROGRESS, COMPLETED, VERIFIED, CANCELLED
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  capa                CapaRecord @relation(fields: [capaId], references: [id], onDelete: Cascade)

  @@map("capa_actions")
  @@index([capaId], map: "idx_cact56_capa")
  @@index([actionType, status], map: "idx_cact56_type_status")
  @@index([responsiblePerson], map: "idx_cact56_resp")
}

// ─── Epic 4: Action Tasks (granular task breakdown) ──────────────────────
model CapaTask {
  id                  String   @id @default(uuid()) @db.Uuid
  capaId              String   @db.Uuid @map("capa_id")
  actionId            String?  @db.Uuid @map("action_id")
  // ─── Task ───
  taskTitle           String   @map("task_title")
  taskDescription     String?  @map("task_description")
  sequence            Int      @default(1) @map("sequence")
  // ─── Assignment ───
  assignedTo          String?  @map("assigned_to")
  assignedToRole      String?  @map("assigned_to_role")
  assignedToDept      String?  @map("assigned_to_dept")
  // ─── Schedule ───
  dueDate             DateTime? @map("due_date")
  completedAt         DateTime? @map("completed_at")
  // ─── Reminder / Escalation ───
  reminderSent        Boolean  @default(false) @map("reminder_sent")
  reminderSentAt      DateTime? @map("reminder_sent_at")
  overdueNotification Boolean  @default(false) @map("overdue_notification")
  escalationLevel     Int      @default(0) @map("escalation_level")
  // ─── Status ───
  status              String   @default("OPEN") @map("status") // OPEN, IN_PROGRESS, COMPLETED, SKIPPED, CANCELLED
  completionNotes     String?  @map("completion_notes")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  capa                CapaRecord @relation(fields: [capaId], references: [id], onDelete: Cascade)

  @@map("capa_tasks")
  @@index([capaId], map: "idx_ctsk56_capa")
  @@index([assignedTo, status], map: "idx_ctsk56_assign_status")
  @@index([dueDate], map: "idx_ctsk56_due")
}

// ─── Epic 5: Effectiveness Verification ──────────────────────────────────
model CapaEffectivenessVerification {
  id                  String   @id @default(uuid()) @db.Uuid
  capaId              String   @db.Uuid @map("capa_id")
  verificationNumber  String   @unique @map("verification_number") // VER-2026-000001
  // ─── Verification Plan ───
  verificationMethod  String   @map("verification_method") // AUDIT, INSPECTION, DATA_ANALYSIS, CUSTOMER_FEEDBACK, KPI_MONITORING, REINSPECTION
  waitingPeriodDays   Int      @default(30) @map("waiting_period_days")
  plannedDate         DateTime? @map("planned_date")
  actualDate          DateTime? @map("actual_date")
  // ─── Inspector ───
  inspectorId         String?  @db.Uuid @map("inspector_id")
  inspectorName       String?  @map("inspector_name")
  inspectorRole       String?  @map("inspector_role")
  // ─── Result ───
  verificationResult  String?  @map("verification_result") // EFFECTIVE, INEFFECTIVE, PARTIALLY_EFFECTIVE
  effectivenessScore  Int?     @map("effectiveness_score") // 0-100
  evidenceUrl         String?  @map("evidence_url") // JSON array
  remarks             String?  @map("remarks")
  // ─── Follow-up ───
  followUpRequired    Boolean  @default(false) @map("follow_up_required")
  followUpCapaId      String?  @db.Uuid @map("follow_up_capa_id") // if ineffective → new CAPA
  followUpNotes       String?  @map("follow_up_notes")
  // ─── Status ───
  status              String   @default("PLANNED") @map("status") // PLANNED, IN_PROGRESS, COMPLETED
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  capa                CapaRecord @relation(fields: [capaId], references: [id], onDelete: Cascade)

  @@map("capa_effectiveness_verifications")
  @@index([capaId], map: "idx_cev56_capa")
  @@index([status], map: "idx_cev56_status")
}

// ─── Epic 4: CAPA Escalation Tracking ────────────────────────────────────
model CapaEscalation {
  id                  String   @id @default(uuid()) @db.Uuid
  capaId              String   @db.Uuid @map("capa_id")
  // ─── Escalation ───
  escalationLevel     Int      @map("escalation_level") // 1, 2, 3, 4
  escalatedFromRole   String?  @map("escalated_from_role")
  escalatedToRole     String   @map("escalated_to_role") // QUALITY_SUPERVISOR, QUALITY_MANAGER, PLANT_HEAD, CEO, QUALITY_HEAD
  escalatedToName     String?  @map("escalated_to_name")
  // ─── Reason ───
  escalationReason    String   @map("escalation_reason") // OVERDUE, INEFFECTIVE, HIGH_RISK, MANAGEMENT_REVIEW
  escalationNotes     String?  @map("escalation_notes")
  // ─── Acknowledgement ───
  acknowledgedAt      DateTime? @map("acknowledged_at")
  acknowledgedBy      String?  @map("acknowledged_by")
  // ─── Status ───
  status              String   @default("PENDING") @map("status") // PENDING, ACKNOWLEDGED, RESOLVED
  escalatedAt         DateTime @default(now()) @map("escalated_at")
  createdAt           DateTime @default(now()) @map("created_at")

  capa                CapaRecord @relation(fields: [capaId], references: [id], onDelete: Cascade)

  @@map("capa_escalations")
  @@index([capaId], map: "idx_cesc56_capa")
  @@index([status], map: "idx_cesc56_status")
}

// ─── Epic 6: Continuous Improvement Register ─────────────────────────────
model ContinuousImprovement {
  id                  String   @id @default(uuid()) @db.Uuid
  ciNumber            String   @unique @map("ci_number") // CI-2026-000001
  // ─── Project ───
  title               String   @map("title")
  description         String   @map("description")
  improvementType     String   @map("improvement_type") // KAIZEN, LEAN, WASTE_REDUCTION, OEE_IMPROVEMENT, QUALITY_IMPROVEMENT, COST_SAVING, ENERGY_SAVING
  category            String?  @map("category")
  // ─── Source ───
  sourceType          String?  @map("source_type") // CAPA, SUGGESTION_BOX, AUDIT, MANAGEMENT_REVIEW, OPERATIONAL_REVIEW
  sourceCapaId        String?  @db.Uuid @map("source_capa_id")
  sourceReference     String?  @map("source_reference")
  // ─── Sponsorship ───
  sponsorName         String?  @map("sponsor_name")
  sponsorRole         String?  @map("sponsor_role")
  championName        String?  @map("champion_name")
  championRole        String?  @map("champion_role")
  department          String?  @map("department")
  team                String?  @map("team") // JSON array of team members
  // ─── Baseline ───
  baselineMetric      String?  @map("baseline_metric")
  baselineValue       Decimal? @db.Decimal(14, 3) @map("baseline_value")
  targetValue         Decimal? @db.Decimal(14, 3) @map("target_value")
  actualValue         Decimal? @db.Decimal(14, 3) @map("actual_value")
  unitOfMeasure       String?  @map("unit_of_measure")
  // ─── Schedule ───
  startDate           DateTime? @map("start_date")
  targetDate          DateTime? @map("target_date")
  completedDate       DateTime? @map("completed_date")
  // ─── Financial Impact ───
  estimatedSavings    Decimal? @db.Decimal(14, 2) @map("estimated_savings")
  actualSavings       Decimal? @db.Decimal(14, 2) @map("actual_savings")
  implementationCost  Decimal? @db.Decimal(14, 2) @map("implementation_cost")
  roiPercent          Decimal? @db.Decimal(8, 2) @map("roi_percent")
  // ─── Status ───
  status              String   @default("PROPOSED") @map("status") // PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
  progressPercent     Int      @default(0) @map("progress_percent")
  // ─── Audit ───
  createdBy           String?  @map("created_by")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("continuous_improvements")
  @@index([improvementType, status], map: "idx_ci56_type_status")
  @@index([department], map: "idx_ci56_dept")
  @@index([status], map: "idx_ci56_status")
}

// ─── Epic 6: Improvement Project (multi-CI rollout) ──────────────────────
model ImprovementProject {
  id                  String   @id @default(uuid()) @db.Uuid
  projectCode         String   @unique @map("project_code") // PRJ-2026-000001
  projectName         String   @map("project_name")
  description         String?  @map("description")
  // ─── Scope ───
  scope               String?  @map("scope") // PLANT_WIDE, DEPARTMENT, LINE, PRODUCT_FAMILY
  affectedDept        String?  @map("affected_dept")
  affectedProducts    String?  @map("affected_products") // JSON array
  // ─── Timeline ───
  startDate           DateTime? @map("start_date")
  endDate             DateTime? @map("end_date")
  // ─── Budget ───
  budgetAllocated     Decimal? @db.Decimal(14, 2) @map("budget_allocated")
  budgetSpent         Decimal? @db.Decimal(14, 2) @map("budget_spent")
  // ─── Status ───
  status              String   @default("PLANNED") @map("status") // PLANNED, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
  progressPercent     Int      @default(0) @map("progress_percent")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("improvement_projects")
  @@index([status], map: "idx_iprj56_status")
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 57 — CERTIFICATE OF ANALYSIS (COA), COMPLIANCE & REGULATORY CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Epic 1: COA Documents ───────────────────────────────────────────────
model CoaDocument {
  id                  String   @id @default(uuid()) @db.Uuid
  coaNumber           String   @unique @map("coa_number") // COA-2026-000001
  // ─── Batch Linkage ───
  batchNumber         String   @map("batch_number")
  productId           String?  @db.Uuid @map("product_id")
  productCode         String?  @map("product_code")
  productName         String?  @map("product_name")
  // ─── Manufacturing Info ───
  manufactureDate     DateTime? @map("manufacture_date")
  expiryDate          DateTime? @map("expiry_date")
  bestBeforeDate      DateTime? @map("best_before_date")
  productionLine      String?  @map("production_line")
  plantCode           String?  @map("plant_code")
  // ─── Customer ───
  customerId          String?  @db.Uuid @map("customer_id")
  customerName        String?  @map("customer_name")
  customerPoNumber    String?  @map("customer_po_number")
  // ─── Spec / Standard ───
  specificationId     String?  @db.Uuid @map("specification_id")
  specVersion         String?  @map("spec_version")
  regulatoryStandard  String?  @map("regulatory_standard") // FSSAI, ISO_22000, HACCP, BRCGS, FDA, EXPORT, CUSTOMER_SPEC
  // ─── Pre-conditions Verified ───
  fgqcPassed          Boolean  @default(false) @map("fgqc_passed")
  fgqcApprovedAt      DateTime? @map("fgqc_approved_at")
  labApproved         Boolean  @default(false) @map("lab_approved")
  labApprovedAt       DateTime? @map("lab_approved_at")
  shelfLifeValid      Boolean  @default(false) @map("shelf_life_valid")
  packagingApproved   Boolean  @default(false) @map("packaging_approved")
  foodSafetyPassed    Boolean  @default(false) @map("food_safety_passed")
  // ─── Generation ───
  generatedAt         DateTime? @map("generated_at")
  generatedBy         String?  @map("generated_by")
  templateId          String?  @db.Uuid @map("template_id")
  // ─── Digital Signature ───
  signedBy            String?  @map("signed_by")
  signedByRole        String?  @map("signed_by_role")
  signedAt            DateTime? @map("signed_at")
  signatureHash       String?  @map("signature_hash")
  qrCodeUrl           String?  @map("qr_code_url")
  // ─── Document ───
  documentUrl         String?  @map("document_url") // PDF URL
  documentHash        String?  @map("document_hash") // SHA-256 for tamper-proofing
  pageCount           Int?     @map("page_count")
  // ─── Distribution ───
  distributedTo       String?  @map("distributed_to") // JSON array of recipients
  distributionChannel String?  @map("distribution_channel") // EMAIL, PORTAL, EXPORT, CUSTOMER_PORTAL
  // ─── Archive ───
  archivedAt          DateTime? @map("archived_at")
  archiveLocation     String?  @map("archive_location")
  // ─── Status ───
  status              String   @default("DRAFT") @map("status") // DRAFT, GENERATED, SIGNED, DISTRIBUTED, ARCHIVED, REVOKED, SUPERSEDED
  supersededBy        String?  @db.Uuid @map("superseded_by")
  revocationReason    String?  @map("revocation_reason")
  // ─── Audit ───
  createdBy           String?  @map("created_by")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  testResults         CoaTestResult[]
  versions            CoaVersion[]

  @@map("coa_documents")
  @@index([batchNumber], map: "idx_coa57_batch")
  @@index([customerName], map: "idx_coa57_customer")
  @@index([status], map: "idx_coa57_status")
  @@index([generatedAt], map: "idx_coa57_generated")
}

// ─── Epic 1: COA Test Results (lab results per spec parameter) ───────────
model CoaTestResult {
  id                  String   @id @default(uuid()) @db.Uuid
  coaId               String   @db.Uuid @map("coa_id")
  // ─── Test ───
  parameterName       String   @map("parameter_name") // e.g., Moisture, Fat, Protein, Microbial Count
  testMethod          String?  @map("test_method") // e.g., AOAC 925.10
  // ─── Spec ───
  specificationMin    String?  @map("specification_min")
  specificationMax    String?  @map("specification_max")
  specificationTarget String?  @map("specification_target")
  unitOfMeasure       String?  @map("unit_of_measure")
  // ─── Result ───
  resultValue         String   @map("result_value")
  resultNumeric       Decimal? @db.Decimal(14, 4) @map("result_numeric")
  passFail            String   @default("PASS") @map("pass_fail") // PASS, FAIL, NA
  // ─── Lab Info ───
  labName             String?  @map("lab_name")
  labSampleId         String?  @map("lab_sample_id")
  testedBy            String?  @map("tested_by")
  testedAt            DateTime? @map("tested_at")
  // ─── Audit ───
  createdAt           DateTime @default(now()) @map("created_at")

  coa                 CoaDocument @relation(fields: [coaId], references: [id], onDelete: Cascade)

  @@map("coa_test_results")
  @@index([coaId], map: "idx_ctr57_coa")
  @@index([passFail], map: "idx_ctr57_passfail")
}

// ─── Epic 1: COA Versions (version control for revisions) ───────────────
model CoaVersion {
  id                  String   @id @default(uuid()) @db.Uuid
  coaId               String   @db.Uuid @map("coa_id")
  versionNumber       Int      @map("version_number") // 1, 2, 3 ...
  // ─── Snapshot ───
  documentUrl         String?  @map("document_url")
  documentHash        String?  @map("document_hash")
  // ─── Change ───
  changeReason        String?  @map("change_reason")
  changeSummary       String?  @map("change_summary")
  // ─── Author ───
  createdBy           String?  @map("created_by")
  createdAt           DateTime @default(now()) @map("created_at")

  coa                 CoaDocument @relation(fields: [coaId], references: [id], onDelete: Cascade)

  @@map("coa_versions")
  @@index([coaId], map: "idx_cv57_coa")
}

// ─── Epic 1: COA Templates ───────────────────────────────────────────────
model CoaTemplate {
  id                  String   @id @default(uuid()) @db.Uuid
  templateCode        String   @unique @map("template_code") // COA-TMPL-KK-001
  templateName        String   @map("template_name")
  // ─── Scope ───
  productFamily       String?  @map("product_family")
  productId           String?  @db.Uuid @map("product_id")
  customerSpecific    Boolean  @default(false) @map("customer_specific")
  customerId          String?  @db.Uuid @map("customer_id")
  // ─── Standard ───
  regulatoryStandard  String   @map("regulatory_standard") // FSSAI, ISO_22000, HACCP, BRCGS, FDA, EXPORT
  // ─── Template Body ───
  headerFields        String?  @map("header_fields") // JSON array
  testParameters      String?  @map("test_parameters") // JSON array of {name, method, spec_min, spec_max, unit}
  footerFields        String?  @map("footer_fields") // JSON array
  // ─── Layout ───
  layoutConfig        String?  @map("layout_config") // JSON
  // ─── Status ───
  isActive            Boolean  @default(true) @map("is_active")
  version             Int      @default(1) @map("version")
  // ─── Audit ───
  createdBy           String?  @map("created_by")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("coa_templates")
  @@index([productFamily], map: "idx_ctmpl57_family")
  @@index([regulatoryStandard], map: "idx_ctmpl57_std")
  @@index([isActive], map: "idx_ctmpl57_active")
}

// ─── Epic 2: Regulatory Compliance Master ────────────────────────────────
model RegulatoryCompliance {
  id                  String   @id @default(uuid()) @db.Uuid
  complianceCode      String   @unique @map("compliance_code") // COMP-FSSAI-001
  // ─── Standard ───
  standardName        String   @map("standard_name") // FSSAI, ISO_22000, HACCP, BRCGS, FDA, EXPORT_COMPLIANCE, CUSTOMER_SPEC
  standardVersion     String?  @map("standard_version") // e.g., 2024, Rev 5
  issuingAuthority    String?  @map("issuing_authority") // FSSAI, ISO, BRC
  // ─── Certificate ───
  certificateNumber   String?  @map("certificate_number")
  certificateUrl      String?  @map("certificate_url")
  // ─── Validity ───
  issuedDate          DateTime? @map("issued_date")
  expiryDate          DateTime? @map("expiry_date")
  renewalDueDate      DateTime? @map("renewal_due_date")
  // ─── Scope ───
  appliesTo           String?  @map("applies_to") // PLANT, PRODUCT_FAMILY, PRODUCT, PROCESS
  scopeDescription    String?  @map("scope_description")
  // ─── Approval ───
  approvedBy          String?  @map("approved_by")
  approvedAt          DateTime? @map("approved_at")
  approvalStatus      String   @default("PENDING") @map("approval_status") // PENDING, APPROVED, REJECTED, RENEWAL_PENDING
  // ─── Audit ───
  nextAuditDate       DateTime? @map("next_audit_date")
  lastAuditDate       DateTime? @map("last_audit_date")
  // ─── Status ───
  status              String   @default("ACTIVE") @map("status") // ACTIVE, EXPIRED, SUSPENDED, REVOKED, RENEWAL_PENDING
  notes               String?  @map("notes")
  createdBy           String?  @map("created_by")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("regulatory_compliances")
  @@index([standardName, status], map: "idx_rc57_std_status")
  @@index([expiryDate], map: "idx_rc57_expiry")
  @@index([status], map: "idx_rc57_status")
}

// ─── Epic 3: Compliance Document Library ─────────────────────────────────
model ComplianceDocument {
  id                  String   @id @default(uuid()) @db.Uuid
  documentCode        String   @unique @map("document_code") // DOC-2026-000001
  // ─── Type ───
  documentType        String   @map("document_type") // COA, COC, INSPECTION_REPORT, LAB_REPORT, AUDIT_REPORT, CALIBRATION_CERT, CLEANING_RECORD
  // ─── Linkage ───
  linkedBatch         String?  @map("linked_batch")
  linkedProduct       String?  @map("linked_product")
  linkedCustomer      String?  @map("linked_customer")
  linkedCoaId         String?  @db.Uuid @map("linked_coa_id")
  // ─── File ───
  title               String   @map("title")
  description         String?  @map("description")
  fileUrl             String   @map("file_url")
  fileSizeBytes       Int?     @map("file_size_bytes")
  mimeType            String?  @map("mime_type")
  pageCount           Int?     @map("page_count")
  // ─── Version Control ───
  version             Int      @default(1) @map("version")
  previousVersionId   String?  @db.Uuid @map("previous_version_id")
  // ─── Digital Signature ───
  signedBy            String?  @map("signed_by")
  signedAt            DateTime? @map("signed_at")
  signatureHash       String?  @map("signature_hash")
  // ─── QR Verification ───
  qrCodeUrl           String?  @map("qr_code_url")
  qrVerificationEnabled Boolean @default(true) @map("qr_verification_enabled")
  // ─── Retention ───
  retentionYears      Int      @default(7) @map("retention_years")
  archiveDate         DateTime? @map("archive_date")
  // ─── Status ───
  isImmutable         Boolean  @default(false) @map("is_immutable") // locked after approval
  status              String   @default("DRAFT") @map("status") // DRAFT, APPROVED, ARCHIVED, REVOKED
  // ─── Audit ───
  uploadedBy          String?  @map("uploaded_by")
  approvedBy          String?  @map("approved_by")
  approvedAt          DateTime? @map("approved_at")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("compliance_documents")
  @@index([documentType], map: "idx_cd57_type")
  @@index([linkedBatch], map: "idx_cd57_batch")
  @@index([status], map: "idx_cd57_status")
}

// ─── Epic 4: Batch Compliance Validation (pre-COA gate) ──────────────────
model BatchComplianceValidation {
  id                  String   @id @default(uuid()) @db.Uuid
  batchNumber         String   @map("batch_number")
  validationCode      String   @unique @map("validation_code") // BCV-2026-000001
  // ─── Validation Checks ───
  fgqcPassed          Boolean  @default(false) @map("fgqc_passed")
  fgqcApprovedAt      DateTime? @map("fgqc_approved_at")
  labApproved         Boolean  @default(false) @map("lab_approved")
  labApprovedAt       DateTime? @map("lab_approved_at")
  shelfLifeValid      Boolean  @default(false) @map("shelf_life_valid")
  shelfLifeCheckedAt  DateTime? @map("shelf_life_checked_at")
  packagingApproved   Boolean  @default(false) @map("packaging_approved")
  packagingCheckedAt  DateTime? @map("packaging_checked_at")
  foodSafetyPassed    Boolean  @default(false) @map("food_safety_passed")
  foodSafetyCheckedAt DateTime? @map("food_safety_checked_at")
  // ─── Overall ───
  allChecksPassed     Boolean  @default(false) @map("all_checks_passed")
  blockedReason       String?  @map("blocked_reason")
  // ─── COA Linkage ───
  coaGenerated        Boolean  @default(false) @map("coa_generated")
  coaId               String?  @db.Uuid @map("coa_id")
  // ─── Audit ───
  validatedBy         String?  @map("validated_by")
  validatedAt         DateTime? @map("validated_at")
  status              String   @default("PENDING") @map("status") // PENDING, PASSED, BLOCKED, COA_GENERATED
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("batch_compliance_validations")
  @@index([batchNumber], map: "idx_bcv57_batch")
  @@index([status], map: "idx_bcv57_status")
}

// ─── Epic 5: Regulatory Submission Center ────────────────────────────────
model RegulatorySubmission {
  id                  String   @id @default(uuid()) @db.Uuid
  submissionCode      String   @unique @map("submission_code") // SUB-2026-000001
  // ─── Submission ───
  submissionType      String   @map("submission_type") // GOVERNMENT_PORTAL, CUSTOMER_PORTAL, EXPORT_DOCS, VENDOR_PORTAL, EMAIL_DIST
  recipientName       String?  @map("recipient_name")
  recipientPortal     String?  @map("recipient_portal")
  // ─── Document ───
  documentIds         String   @map("document_ids") // JSON array of compliance_document IDs
  coaIds              String?  @map("coa_ids") // JSON array
  // ─── Submission ───
  submittedBy         String?  @map("submitted_by")
  submittedAt         DateTime? @map("submitted_at")
  acknowledgedAt      DateTime? @map("acknowledged_at")
  acknowledgementRef  String?  @map("acknowledgement_ref")
  // ─── Status ───
  status              String   @default("DRAFT") @map("status") // DRAFT, SUBMITTED, ACKNOWLEDGED, REJECTED, ARCHIVED
  notes               String?  @map("notes")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("regulatory_submissions")
  @@index([submissionType, status], map: "idx_rs57_type_status")
  @@index([status], map: "idx_rs57_status")
}

// ─── Epic 6: Compliance Audit Log ────────────────────────────────────────
model ComplianceAuditLog {
  id                  String   @id @default(uuid()) @db.Uuid
  entityType          String   @map("entity_type") // COA, COMPLIANCE, DOCUMENT, SUBMISSION, CERTIFICATE
  entityId            String   @db.Uuid @map("entity_id")
  entityCode          String?  @map("entity_code")
  // ─── Change ───
  action              String   @map("action") // CREATE, UPDATE, APPROVE, SIGN, REVOKE, DISTRIBUTE, ARCHIVE
  fieldName           String?  @map("field_name")
  oldValue            String?  @map("old_value")
  newValue            String?  @map("new_value")
  // ─── Actor ───
  actorName           String?  @map("actor_name")
  actorRole           String?  @map("actor_role")
  ipAddress           String?  @map("ip_address")
  // ─── Notes ───
  reason              String?  @map("reason")
  notes               String?  @map("notes")
  // ─── Timestamp ───
  createdAt           DateTime @default(now()) @map("created_at")

  @@map("compliance_audit_logs")
  @@index([entityType, entityId], map: "idx_cal57_entity")
  @@index([action], map: "idx_cal57_action")
  @@index([createdAt], map: "idx_cal57_created")
}
"""

def main():
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    # Append a separator comment and the new models
    if "Sprint 56" in content and "CapaRecord" in content:
        print("Sprint 56/57 models already present — skipping append.")
        return
    new_content = content.rstrip() + "\n\n" + SPRINT_56_57_MODELS.rstrip() + "\n"
    with open(SCHEMA_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)
    # Quick counts
    import re
    new_models = re.findall(r"^model\s+(\w+)", SPRINT_56_57_MODELS, flags=re.MULTILINE)
    print(f"Appended {len(new_models)} models:")
    for m in new_models:
        print(f"  - {m}")

if __name__ == "__main__":
    main()
