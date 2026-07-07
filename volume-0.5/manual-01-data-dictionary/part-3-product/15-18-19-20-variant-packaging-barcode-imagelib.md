# Manual 1 · Part 3 · Entities 15, 18, 19, 20 — Variant, Packaging, Barcode, Image Library

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 3 — Product Master Domain |
| Entities | Product Variant (015), Packaging Master (018), Barcode Master (019), Product Image Library (020) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity 015 — Product Variant

### 1. Business Purpose

The `ProductVariant` entity defines **variant attributes** that distinguish products within the same Product Family. While each variant is a separate Product (with its own SKU, barcode, batch tracking), the variant attributes explain **how** they differ.

For example, the "Kaju Katli" family contains:
- Kaju Katli 250g (variant: weight=250g)
- Kaju Katli 500g (variant: weight=500g)
- Kaju Katli 1kg (variant: weight=1kg)
- Kaju Katli Gift Box 1kg (variant: weight=1kg, packaging=Gift Box)
- Kaju Katli Sugar Free 500g (variant: weight=500g, type=Sugar Free)

**Important architectural note**: Per Volume 0 Part 3 (Entity 011), each variant is a **full Product record**. The `ProductVariant` entity is a **companion table** that stores variant-specific attributes (weight, flavor, color, pack size, etc.) alongside the Product record. This separation allows:
- Standard Product fields (SKU, barcode, batch tracking) on Product
- Variant differentiation fields on ProductVariant
- Variant-based search and filtering
- Family-level reporting that aggregates all variants

Variant attributes are **configurable** — different categories may use different variant dimensions (sweets use weight + sugar-free; namkeen use weight + spice-level; beverages use volume + flavor).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `product_variants` |
| Prisma Model | `ProductVariant` |
| File Location | `prisma/schema/master/product/product_variant.prisma` |
| Partitioning | None (1:1 with products) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, auto-generated: `{product_family_code}-{variant_code}` | Variant code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — Variant is company-wide |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Variant-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `product_id` | UUID | Yes | — | FK to `products.id`, unique (1:1) | The product this variant describes | Internal | — |
| `product_family_id` | UUID | Yes | — | FK to `product_families.id`; must match product's family | Family for consistency check | Internal | — |
| `variant_name` | VARCHAR(200) | Yes | — | Min 3, max 200 | Display name for variant (e.g., "500g Premium Pack") | Public | — |
| `variant_code` | VARCHAR(30) | Yes | — | Unique per family, format `^[A-Z0-9\-]{2,20}$` | Short variant code (e.g., `500G`, `1KG-GB`) | Internal | — |
| `variant_type` | ENUM | Yes | `STANDARD` | STANDARD, GIFT_BOX, FESTIVAL_EDITION, BULK_PACK, SAMPLE, SEASONAL, SUGAR_FREE, ORGANIC, PREMIUM | Variant category | Internal | Demand AI |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order within family | Internal | — |
| `weight_g` | DECIMAL(10,4) | No | NULL | > 0 | Variant weight in grams (if weight-based variant) | Internal | — |
| `volume_ml` | DECIMAL(10,4) | No | NULL | > 0 | Variant volume in milliliters (if volume-based) | Internal | — |
| `pack_size` | INTEGER | No | NULL | > 0 | Number of units in pack (e.g., 24 for 24-pack) | Internal | — |
| `flavor` | VARCHAR(50) | No | NULL | — | Flavor (e.g., "Original", "Spicy", "Mint") | Public | — |
| `color` | VARCHAR(50) | No | NULL | — | Color (for non-food items) | Public | — |
| `spice_level` | ENUM | No | NULL | MILD, MEDIUM, HOT, EXTRA_HOT | Spice level (for namkeen/snacks) | Public | — |
| `diet_type` | ENUM | No | `REGULAR` | REGULAR, SUGAR_FREE, DIABETIC_FRIENDLY, LOW_FAT, ORGANIC, JAIN, VEGAN | Diet classification | Public | — |
| `packaging_type` | ENUM | No | NULL | STANDARD, GIFT_BOX, FESTIVAL_BOX, BULK_BAG, RETAIL_PACK | Packaging type | Internal | — |
| `target_audience` | VARCHAR(100) | No | NULL | — | Target audience description (e.g., "Festival gift", "Daily consumption") | Internal | Demand AI |
| `is_default_variant` | BOOLEAN | Yes | `false` | Only one default per family | Default variant for family-level display | Internal | — |
| `launch_date` | DATE | No | NULL | — | Variant-specific launch date | Internal | — |
| `discontinue_date` | DATE | No | NULL | > launch_date | Planned discontinuation | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Variant → Product | 1 : 1 | `product_id` | CASCADE (variant deleted with product) |
| Variant → ProductFamily | N : 1 | `product_family_id` | RESTRICT |
| Variant → Company | N : 1 | `company_id` | RESTRICT |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_product_variants` | PK | `id` |
| `uq_variants_product` | UNIQUE | `product_id` (1:1) |
| `uq_variants_code_family` | UNIQUE | `product_family_id, variant_code` |
| `idx_variants_family` | B-TREE | `product_family_id, display_order` |
| `idx_variants_type` | B-TREE | `variant_type` |
| `idx_variants_default` | PARTIAL | `product_family_id WHERE is_default_variant = true` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `product_id` unique (1:1) | DB |
| 2 | `variant_code` unique per family | DB |
| 3 | `product_family_id` must match `product.product_family_id` | App |
| 4 | Only one `is_default_variant = true` per family | App |
| 5 | `display_order` > 0 | DB |
| 6 | At least one variant attribute must be set (`weight_g`, `volume_ml`, `pack_size`, `flavor`, `color`, `spice_level`, `diet_type`, `packaging_type`) | App |
| 7 | `discontinue_date` > `launch_date` if both set | DB |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/product-variants` (GET, POST), `/api/v1/product-variants/:id` (GET, PATCH), `/api/v1/products/:id/variant` (GET — variant for product), `/api/v1/product-families/:id/variants` (GET — all variants in family) |
| **UI** | Variant list within family detail, Variant create form (alongside product create), Variant comparison view |
| **Mobile** | Variant selector when adding to cart/order, variant badge on product |
| **Reports** | Variant Performance Report, Variant Comparison, Default Variant Audit |
| **Audit** | Full; mandatory reason for variant_type change, is_default_variant change |

### 13-16. Security / AI / Performance / Example

**Security**: `variant_name`, `flavor`, `color`, `spice_level`, `diet_type` = Public; `variant_code`, `variant_type`, `display_order`, packaging_type = Internal.

**AI**: Demand Forecast AI (variant-level forecasting), Recommendation AI (variant recommendations), Pricing AI (variant-specific pricing).

**Performance**: < 500 per company; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-var-kaju-katli-500",
  "code": "FAM-KAJU-KATLI-500G",
  "company_id": "01928f7a-...-company",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "variant_name": "500g Premium Pack",
  "variant_code": "500G",
  "variant_type": "STANDARD",
  "display_order": 10,
  "weight_g": 500.0000,
  "diet_type": "REGULAR",
  "packaging_type": "RETAIL_PACK",
  "is_default_variant": true,
  "launch_date": "2024-10-15",
  "status": "ACTIVE",
  "version": 1
}
```

Sugar-free variant example:
```json
{
  "id": "01928f7a-...-var-kaju-katli-500-sf",
  "code": "FAM-KAJU-KATLI-500G-SF",
  "product_id": "01928f7a-...-prod-kaju-katli-500-sf",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "variant_name": "500g Sugar Free",
  "variant_code": "500G-SF",
  "variant_type": "SUGAR_FREE",
  "display_order": 30,
  "weight_g": 500.0000,
  "diet_type": "SUGAR_FREE",
  "packaging_type": "RETAIL_PACK",
  "target_audience": "Diabetic-friendly customers",
  "is_default_variant": false,
  "status": "ACTIVE"
}
```

---

## Entity 018 — Packaging Master

### 1. Business Purpose

The `PackagingMaster` entity defines the **packaging hierarchy** for products — how individual pieces are grouped into larger units for storage, handling, and shipping. The packaging hierarchy enables:

- **Efficient putaway/picking** — pick by carton instead of by piece
- **Bulk handling** — receive by pallet, store by carton, sell by piece
- **Shipping optimization** — calculate cartons per pallet, pallets per truck
- **Barcode scanning at multiple levels** — scan pallet barcode to receive all cartons
- **Cost tracking** — packaging cost per level (piece wrapping, carton, pallet wrap)

Per Volume 0 Chapter 7 §7.6, Packaging Specification is one of the 6 versioned master data types. The PackagingMaster entity holds the structural definition; the `PackagingSpecification` sub-entity (versioned) holds the detailed specifications (dimensions, materials, artwork version).

**Packaging hierarchy example**:
```
1 Piece (EA)
  ↓ × 24 (per product)
1 Inner Box (BOX)
  ↓ × 20
1 Carton (CTN)
  ↓ × 10
1 Pallet (PLT)
```

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `packaging_master` |
| Prisma Model | `PackagingMaster` |
| File Location | `prisma/schema/master/product/packaging_master.prisma` |
| Lifecycle | Master Data Lifecycle + Versioned (PackagingSpecification) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PKG-` | Packaging code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — company-wide |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Packaging-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 3, max 100 | Packaging name (e.g., "Standard Carton 200x150x50") | Public | — |
| `name_short` | VARCHAR(30) | Yes | — | Min 2 | Short name | Public | — |
| `description` | TEXT | No | NULL | — | Description | Internal | — |
| `product_id` | UUID | No | NULL | FK to `products.id`; NULL = generic packaging (reusable across products) | Linked product (NULL = generic) | Internal | — |
| `package_type` | ENUM | Yes | — | PIECE, INNER_BOX, BOX, CARTON, PALLET, BAG, POUCH, TRAY, BOTTLE, JAR, TUBE, OTHER | Package type | Internal | — |
| `package_level` | SMALLINT | Yes | — | 1–10 | Level in hierarchy (1=piece, 2=box, 3=carton, 4=pallet) | Internal | — |
| `parent_packaging_id` | UUID | No | NULL | FK self-ref | Parent packaging (next level up) | Internal | — |
| `quantity_per_parent` | DECIMAL(18,4) | No | NULL | > 0; required if parent_packaging_id set | How many of this fit in parent (e.g., 24 pieces per box) | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM this packaging represents (e.g., BOX, CTN, PLT) | Internal | — |
| `length_cm` | DECIMAL(8,2) | No | NULL | > 0 | External length | Internal | — |
| `width_cm` | DECIMAL(8,2) | No | NULL | > 0 | External width | Internal | — |
| `height_cm` | DECIMAL(8,2) | No | NULL | > 0 | External height | Internal | — |
| `inner_length_cm` | DECIMAL(8,2) | No | NULL | > 0 | Internal length (usable space) | Internal | — |
| `inner_width_cm` | DECIMAL(8,2) | No | NULL | > 0 | Internal width | Internal | — |
| `inner_height_cm` | DECIMAL(8,2) | No | NULL | > 0 | Internal height | Internal | — |
| `weight_empty_g` | DECIMAL(10,4) | No | NULL | ≥ 0 | Empty packaging weight | Internal | — |
| `weight_capacity_g` | DECIMAL(10,4) | No | NULL | > 0 | Max content weight | Internal | Capacity AI |
| `volume_capacity_ml` | DECIMAL(10,4) | No | NULL | > 0 | Max content volume | Internal | Capacity AI |
| `material` | ENUM | No | NULL | CARDBOARD, PLASTIC, GLASS, METAL, WOOD, PAPER, BIODEGRADABLE, COMPOSITE, OTHER | Packaging material | Internal | Sustainability AI |
| `material_grade` | VARCHAR(50) | No | NULL | — | Material grade/specification | Internal | — |
| `color` | VARCHAR(50) | No | NULL | — | Packaging color | Internal | — |
| `is_stackable` | BOOLEAN | Yes | `true` | — | Whether packages can be stacked | Internal | Storage AI |
| `max_stack_layers` | INTEGER | No | NULL | > 0; required if is_stackable=true | Max stack height (layers) | Internal | — |
| `is_returnable` | BOOLEAN | Yes | `false` | — | Returnable packaging (e.g., reusable crates) | Internal | — |
| `return_deposit_amount` | DECIMAL(18,4) | No | NULL | ≥ 0; required if is_returnable=true | Deposit amount | Confidential | — |
| `barcode_required` | BOOLEAN | Yes | `true` | — | Whether this packaging level needs barcode | Internal | — |
| `barcode_format` | ENUM | No | `CODE128` | CODE128, GS1_128, QR, EAN13, UPC, DATA_MATRIX | Barcode format (per Ch 17 §17.4) | Internal | — |
| `barcode_value` | VARCHAR(100) | No | NULL | — | Generated barcode (e.g., SSCC for cartons per GS1) | Public | — |
| `label_template_id` | UUID | No | NULL | FK to `label_templates.id` | Label template for this packaging | Internal | — |
| `cost_per_unit` | DECIMAL(18,4) | No | NULL | ≥ 0 | Cost per packaging unit | Confidential | — |
| `supplier_id` | UUID | No | NULL | FK to `vendors.id` | Packaging supplier | Confidential | — |
| `is_food_grade` | BOOLEAN | Yes | `true` | — | Food-grade certified (FSSAI compliance) | Confidential | — |
| `artwork_version` | VARCHAR(20) | No | NULL | — | Artwork version (for packaging design tracking) | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| PackagingMaster → Company | N : 1 | `company_id` | RESTRICT |
| PackagingMaster → Product | N : 1 | `product_id` | SET NULL |
| PackagingMaster → PackagingMaster (parent) | N : 1 | `parent_packaging_id` (self-ref) | SET NULL |
| PackagingMaster → UOM | N : 1 | `uom_id` | RESTRICT |
| PackagingMaster → LabelTemplate | N : 1 | `label_template_id` | SET NULL |
| PackagingMaster → Vendor | N : 1 | `supplier_id` | SET NULL |
| PackagingMaster → PackagingSpecification | 1 : N | `packaging_specifications.packaging_id` | CASCADE |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_packaging_master` | PK | `id` |
| `uq_packaging_code_company` | UNIQUE | `company_id, code` |
| `idx_packaging_product` | B-TREE | `product_id WHERE product_id IS NOT NULL` |
| `idx_packaging_type` | B-TREE | `company_id, package_type, package_level` |
| `idx_packaging_parent` | B-TREE | `parent_packaging_id` |
| `idx_packaging_barcode` | B-TREE | `barcode_value WHERE barcode_value IS NOT NULL` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `name` required | DB |
| 3 | `package_level` 1–10 | DB |
| 4 | If `parent_packaging_id` set, `quantity_per_parent` required | DB CHECK |
| 5 | `parent_packaging_id` must be higher `package_level` than this | App |
| 6 | `parent_packaging_id` cannot create cycle | App |
| 7 | `parent_packaging_id` must belong to same product (or both generic) | App |
| 8 | If `is_stackable = true`, `max_stack_layers` required | DB CHECK |
| 9 | If `is_returnable = true`, `return_deposit_amount` required | DB CHECK |
| 10 | If `is_food_grade = true` and product is food, material must be food-safe | App |
| 11 | Inner dimensions ≤ external dimensions | App |
| 12 | State transition DRAFT → SUBMITTED requires `name`, `package_type`, `package_level`, `uom_id` | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/packaging` (GET, POST), `/api/v1/packaging/:id` (GET, PATCH), `/api/v1/products/:id/packaging` (GET — product packaging hierarchy), `/api/v1/packaging/:id/hierarchy` (GET — full hierarchy tree), `/api/v1/packaging/:id/labels` (POST — generate labels) |
| **UI** | Packaging List (AG Grid), Packaging Detail (with hierarchy tree), Packaging Create Form (multi-section), Packaging Hierarchy Visualizer |
| **Mobile** | Scan pallet/carton barcode to receive all contained items, packaging info card, label reprint |
| **Reports** | Packaging Master Report, Packaging Hierarchy Report, Packaging Cost Report, Returnable Packaging Tracking |
| **Audit** | Full; mandatory reason for quantity_per_parent change, barcode_value change, material change |

### 13-16. Security / AI / Performance / Example

**Security**: `name`, `package_type`, `barcode_value` = Public; dimensions, weights = Internal; `cost_per_unit`, `return_deposit_amount` = Confidential; `is_food_grade` = Confidential.

**AI**: Storage Optimization AI (bin assignment based on dimensions), Packaging Cost AI, Sustainability AI (material selection), Hierarchy Optimization AI (suggests optimal packaging levels).

**Performance**: < 1000 per company; Redis cache TTL 1 hour.

#### Example: Kaju Katli 500g Packaging Hierarchy

```json
[
  {
    "id": "01928f7a-...-pkg-kaju-piece",
    "code": "PKG-KJU-500-PC",
    "company_id": "01928f7a-...-company",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "name": "Kaju Katli 500g Piece Packaging",
    "package_type": "PIECE",
    "package_level": 1,
    "uom_id": "01928f7a-...-uom-ea",
    "weight_empty_g": 15.0000,
    "material": "CARDBOARD",
    "is_food_grade": true,
    "status": "ACTIVE",
    "version": 1
  },
  {
    "id": "01928f7a-...-pkg-kaju-box",
    "code": "PKG-KJU-500-BOX",
    "company_id": "01928f7a-...-company",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "name": "Kaju Katli 500g Box (24 pieces)",
    "package_type": "BOX",
    "package_level": 2,
    "parent_packaging_id": "01928f7a-...-pkg-kaju-piece",
    "quantity_per_parent": 24.0000,
    "uom_id": "01928f7a-...-uom-box",
    "length_cm": 30.00,
    "width_cm": 20.00,
    "height_cm": 15.00,
    "weight_empty_g": 200.0000,
    "weight_capacity_g": 12000.0000,
    "material": "CARDBOARD",
    "material_grade": "300 GSM",
    "is_stackable": true,
    "max_stack_layers": 8,
    "is_food_grade": true,
    "barcode_required": true,
    "barcode_format": "GS1_128",
    "barcode_value": "01928f7a...01928f7a",
    "cost_per_unit": 12.5000,
    "status": "ACTIVE",
    "version": 2
  },
  {
    "id": "01928f7a-...-pkg-kaju-ctn",
    "code": "PKG-KJU-500-CTN",
    "company_id": "01928f7a-...-company",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "name": "Kaju Katli 500g Carton (20 boxes)",
    "package_type": "CARTON",
    "package_level": 3,
    "parent_packaging_id": "01928f7a-...-pkg-kaju-box",
    "quantity_per_parent": 20.0000,
    "uom_id": "01928f7a-...-uom-ctn",
    "length_cm": 50.00,
    "width_cm": 40.00,
    "height_cm": 30.00,
    "weight_empty_g": 800.0000,
    "weight_capacity_g": 240000.0000,
    "material": "CARDBOARD",
    "material_grade": "5-ply corrugated",
    "is_stackable": true,
    "max_stack_layers": 5,
    "is_food_grade": true,
    "barcode_required": true,
    "barcode_format": "GS1_128",
    "barcode_value": "01928f7a...01928f7a",
    "cost_per_unit": 45.0000,
    "status": "ACTIVE",
    "version": 1
  },
  {
    "id": "01928f7a-...-pkg-kaju-plt",
    "code": "PKG-KJU-500-PLT",
    "company_id": "01928f7a-...-company",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "name": "Kaju Katli 500g Pallet (10 cartons)",
    "package_type": "PALLET",
    "package_level": 4,
    "parent_packaging_id": "01928f7a-...-pkg-kaju-ctn",
    "quantity_per_parent": 10.0000,
    "uom_id": "01928f7a-...-uom-plt",
    "length_cm": 120.00,
    "width_cm": 100.00,
    "height_cm": 150.00,
    "weight_empty_g": 25000.0000,
    "weight_capacity_g": 2400000.0000,
    "material": "WOOD",
    "is_stackable": false,
    "is_returnable": true,
    "return_deposit_amount": 500.0000,
    "barcode_required": true,
    "barcode_format": "GS1_128",
    "barcode_value": "01928f7a...01928f7a",
    "status": "ACTIVE",
    "version": 1
  }
]
```

---

## Entity 019 — Barcode Master

### 1. Business Purpose

The `Barcode` entity is the **central registry of every barcode** in SUOP. Per Volume 0 Chapter 17 §17.1, "Barcodes are not labels. They are the digital identity of every physical object inside SUOP."

The Barcode Master stores:
- Every barcode generated (per Ch 17 §17.5 format: `SDH-WH01-PRD-000245-7`)
- Every barcode scanned (for audit + analytics)
- Format type (GS1-128, Code128, QR, EAN-13, UPC, Data Matrix per Ch 17 §17.4)
- Linked entity (product, batch, location, asset, pallet, carton, employee, etc.)
- Print count, last printed timestamp
- Status (active, damaged, reprinted, retired)
- Sync to POS systems

This entity is critical for:
- **Scan-first operations** (per Ch 1 §2.4, Ch 12 §12.15, Ch 17 §17.1)
- **5-minute recall** (Ch 1 §2.8) — barcodes trace physical items
- **Anti-counterfeit** (per Ch 17 §17.11) — unique barcodes prevent duplicates
- **POS sync** — barcodes pushed to POS systems for retail
- **Barcode analytics** (per Ch 17 §17.12) — scan count, failure rate

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — IT Head |
| Data Owner | IT Head |
| Technical Owner | Backend Lead — Barcode Engine |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `barcodes` |
| Prisma Model | `Barcode` |
| File Location | `prisma/schema/master/product/barcode.prisma` |
| Partitioning | None initially (medium volume — max ~100k barcodes); future partitioning by `created_at` if > 1M |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Auto-generated (sequential) | Internal barcode record code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | FK to facilities; NULL = company-wide barcode | Facility scope |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, DAMAGED, REPRINTED, RETIRED | Barcode status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Barcode-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `barcode_value` | VARCHAR(100) | Yes | — | Unique globally, generated per Ch 17 §17.5 format | Full barcode string (e.g., `SDH-WH01-PRD-000245-7`) | Public | Scan analytics |
| `barcode_type` | ENUM | Yes | — | PRODUCT, BATCH, LOCATION, ASSET, PALLET, CARTON, EMPLOYEE, VISITOR, SHIPPING, RETURN, CONTAINER, DOCUMENT | Type of object this barcode identifies (per Ch 17 §17.3) | Internal | — |
| `format` | ENUM | Yes | `CODE128` | CODE128, GS1_128, QR, EAN13, UPC, DATA_MATRIX | Barcode format (per Ch 17 §17.4) | Internal | — |
| `checksum` | VARCHAR(5) | Yes | — | Luhn checksum | Checksum digit(s) for validation | Internal | — |
| `entity_type` | ENUM | Yes | — | PRODUCT, BATCH, LOCATION, ASSET, EMPLOYEE, etc. | Linked entity type | Internal | — |
| `entity_id` | UUID | Yes | — | FK to linked entity (polymorphic) | Linked entity ID | Internal | — |
| `product_id` | UUID | No | NULL | FK to `products.id`; set if barcode_type=PRODUCT | Convenience FK to product | Internal | — |
| `variant_id` | UUID | No | NULL | FK to `product_variants.id` | Variant reference | Internal | — |
| `packaging_id` | UUID | No | NULL | FK to `packaging_master.id` | Packaging reference (for packaging barcodes) | Internal | — |
| `is_primary` | BOOLEAN | Yes | `false` | — | If true, this is the primary barcode for the entity | Internal | — |
| `is_external_facing` | BOOLEAN | Yes | `false` | — | If true, barcode appears on consumer packaging (GS1 format) | Internal | — |
| `gs1_gtin` | VARCHAR(14) | No | NULL | GS1 GTIN format | GTIN for retail products (per GS1 standards) | Public | — |
| `gs1_company_prefix` | VARCHAR(7) | No | NULL | — | GS1 company prefix | Internal | — |
| `print_count` | INTEGER | Yes | `0` | ≥ 0 | Number of times label printed | Internal | — |
| `last_printed_at` | TIMESTAMPTZ | No | NULL | — | Last print timestamp | Internal | — |
| `scan_count` | INTEGER | Yes | `0` | ≥ 0 | Number of times scanned (denormalized) | Internal | Scan analytics |
| `last_scanned_at` | TIMESTAMPTZ | No | NULL | — | Last scan timestamp | Internal | — |
| `is_pos_synced` | BOOLEAN | Yes | `false` | — | Whether barcode synced to POS system | Internal | — |
| `pos_synced_at` | TIMESTAMPTZ | No | NULL | — | Last POS sync timestamp | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective dating | Internal | — |
| `effective_to` | DATE | No | NULL | > effective_from | Effective dating end | Internal | — |
| `replaces_barcode_id` | UUID | No | NULL | FK self-ref | Previous barcode this one replaces (for reprints) | Internal | — |
| `replaced_by_barcode_id` | UUID | No | NULL | FK self-ref | New barcode that replaces this one | Internal | — |
| `damage_report_count` | INTEGER | Yes | `0` | ≥ 0 | Number of damage reports (per Q103) | Internal | — |
| `last_damage_reported_at` | TIMESTAMPTZ | No | NULL | — | Last damage report | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Barcode → Company | N : 1 | `company_id` | RESTRICT |
| Barcode → Facility | N : 1 | `facility_id` | SET NULL |
| Barcode → Product | N : 1 | `product_id` | CASCADE (barcodes deleted with product) |
| Barcode → ProductVariant | N : 1 | `variant_id` | SET NULL |
| Barcode → PackagingMaster | N : 1 | `packaging_id` | CASCADE |
| Barcode → Barcode (replaces) | N : 1 | `replaces_barcode_id` (self-ref) | SET NULL |
| Barcode → Barcode (replaced_by) | N : 1 | `replaced_by_barcode_id` (self-ref) | SET NULL |
| Barcode → ScanLog | 1 : N | `scan_logs.barcode_id` | CASCADE |
| Barcode → PrintJob | 1 : N | `print_jobs.barcode_id` | SET NULL |

### 6. Index Strategy

| Index | Type | Columns | Rationale |
|---|---|---|---|
| `pk_barcodes` | PK | `id` | Default PK |
| `uq_barcodes_value` | UNIQUE | `barcode_value` | Global barcode uniqueness (per Ch 17 §17.11) |
| `idx_barcodes_entity` | B-TREE | `entity_type, entity_id` | Find barcodes for an entity |
| `idx_barcodes_product` | B-TREE | `product_id WHERE product_id IS NOT NULL` | Find barcodes for a product |
| `idx_barcodes_type` | B-TREE | `company_id, barcode_type, status` | Filter by type |
| `idx_barcodes_primary` | PARTIAL | `entity_type, entity_id WHERE is_primary = true AND status = 'ACTIVE'` | Find primary barcode |
| `idx_barcodes_pos_sync` | PARTIAL | `company_id WHERE is_pos_synced = false AND is_external_facing = true` | Pending POS sync |
| `idx_barcodes_scan_count` | B-TREE | `scan_count DESC` | Most-scanned barcodes (analytics) |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `barcode_value` unique globally | DB |
| 2 | `checksum` must be valid Luhn checksum of barcode_value | App |
| 3 | `entity_type` and `entity_id` required together | DB |
| 4 | Only one `is_primary = true` per (entity_type, entity_id) | App |
| 5 | If `format = GS1_128`, `gs1_gtin` required for PRODUCT type | App |
| 6 | If `is_external_facing = true`, format must be GS1_128, EAN13, or UPC | App |
| 7 | `replaces_barcode_id` cannot reference self | App |
| 8 | `replaces_barcode_id` cannot create cycle | App |
| 9 | If `replaces_barcode_id` set, replaced barcode's `replaced_by_barcode_id` must be set to this | App |
| 10 | `effective_to` > `effective_from` | DB CHECK |
| 11 | Cannot delete barcode with scan_count > 0 (audit trail) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/barcodes` (GET, POST), `/api/v1/barcodes/:id` (GET, PATCH), `/api/v1/barcodes/lookup?value=X` (GET — fast lookup, < 200ms), `/api/v1/barcodes/by-entity?type=X&id=Y` (GET), `/api/v1/barcodes/:id/reprint` (POST — request reprint), `/api/v1/barcodes/:id/report-damage` (POST), `/api/v1/barcodes/sync-pos` (POST — push to POS), `/api/v1/barcodes/:id/scan-history` (GET) |
| **UI** | Barcode List (AG Grid), Barcode Detail (with scan history + print history), Barcode Generator (per entity), Damage Report Manager, POS Sync Status |
| **Mobile** | Barcode scan (primary interaction — per Ch 17 §17.9), barcode info card on scan, damage report from mobile, reprint request |
| **Reports** | Barcode Master Report, Scan Analytics Report (per Ch 17 §17.12), Damage Report, POS Sync Status, Print History |
| **Audit** | Full; mandatory reason for reprint, status change (DAMAGED/RETIRED), POS sync |

### 13-16. Security / AI / Performance / Example

**Security**: `barcode_value`, `format`, `gs1_gtin` = Public; `entity_type`, `entity_id`, `is_primary`, `is_external_facing` = Internal; `scan_count`, `print_count`, `damage_report_count` = Internal.

**AI**: Scan Analytics AI (per Ch 17 §17.12), Damage Pattern AI (predicts damage-prone barcodes/locations), Print Optimization AI, Anti-Counterfeit AI.

**Performance**: < 100k per company; barcode lookup MUST be < 200ms (per Ch 20 §20.10) — achieved via dedicated unique index on `barcode_value` + Redis cache (4-hour TTL).

#### Example 1: Product Barcode (Internal Code128)

```json
{
  "id": "01928f7a-...-bc-kaju-500",
  "code": "BC-000123",
  "company_id": "01928f7a-...-company",
  "facility_id": null,
  "barcode_value": "SDH-PRD-000123-7",
  "barcode_type": "PRODUCT",
  "format": "CODE128",
  "checksum": "7",
  "entity_type": "PRODUCT",
  "entity_id": "01928f7a-...-prod-kaju-katli-500",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "is_primary": true,
  "is_external_facing": false,
  "print_count": 5,
  "last_printed_at": "2026-07-05T10:30:00Z",
  "scan_count": 1247,
  "last_scanned_at": "2026-07-07T08:15:00Z",
  "is_pos_synced": true,
  "pos_synced_at": "2026-07-01T12:00:00Z",
  "status": "ACTIVE",
  "version": 3
}
```

#### Example 2: Product Barcode (External GS1-128)

```json
{
  "id": "01928f7a-...-bc-kaju-500-gs1",
  "company_id": "01928f7a-...-company",
  "barcode_value": "01928f7a...01928f7a",
  "barcode_type": "PRODUCT",
  "format": "GS1_128",
  "checksum": "3",
  "entity_type": "PRODUCT",
  "entity_id": "01928f7a-...-prod-kaju-katli-500",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "is_primary": false,
  "is_external_facing": true,
  "gs1_gtin": "8901234567890",
  "gs1_company_prefix": "8901234",
  "print_count": 12000,
  "scan_count": 45000,
  "is_pos_synced": true,
  "pos_synced_at": "2026-07-01T12:00:00Z",
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 3: Location Barcode (Bin)

```json
{
  "id": "01928f7a-...-bc-bin",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-rm-01",
  "barcode_value": "SDH-WH-RM-01-Z01-A-R01-S01-B01-2",
  "barcode_type": "LOCATION",
  "format": "CODE128",
  "checksum": "2",
  "entity_type": "LOCATION",
  "entity_id": "01928f7a-...-bin01",
  "is_primary": true,
  "is_external_facing": false,
  "print_count": 2,
  "scan_count": 856,
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 4: Pallet Barcode (SSCC)

```json
{
  "id": "01928f7a-...-bc-pallet",
  "company_id": "01928f7a-...-company",
  "barcode_value": "00928f7a0000000015",
  "barcode_type": "PALLET",
  "format": "GS1_128",
  "checksum": "5",
  "entity_type": "PALLET",
  "entity_id": "01928f7a-...-pallet-001",
  "packaging_id": "01928f7a-...-pkg-kaju-plt",
  "is_primary": true,
  "is_external_facing": true,
  "gs1_gtin": "0928f7a0000001",
  "print_count": 1,
  "scan_count": 12,
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity 020 — Product Image Library

### 1. Business Purpose

The `ProductImageLibrary` entity stores **all images associated with a product** — front, back, nutrition label, ingredients list, certificates, packaging artwork, MSDS (for chemicals), and marketing images.

Per Volume 0 Chapter 10 §10.12, files are NOT stored in PostgreSQL — only metadata. Actual images are stored in object storage (Supabase Storage / S3). This entity holds the metadata + storage references.

The Image Library enables:
- **Mobile product lookup** — show product image on scan
- **POS display** — product images at checkout
- **E-commerce/catalog** — marketing images for online channels
- **Compliance documentation** — FSSAI labeling images (front, back, ingredients, nutritional info)
- **QC reference** — inspectors compare actual product to reference images
- **Packaging artwork tracking** — version-controlled artwork for print reproduction

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `product_image_libraries` |
| Prisma Model | `ProductImageLibrary` |
| File Location | `prisma/schema/master/product/product_image_library.prisma` |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Auto-generated: `{product_code}-IMG-LIB` | Library code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — library is company-wide |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Library-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `product_id` | UUID | Yes | — | FK to `products.id`, unique (1:1) | The product this library belongs to | Internal |
| `library_name` | VARCHAR(200) | Yes | — | Min 3, max 200 | Library display name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `total_images` | INTEGER | Yes | `0` | ≥ 0 | Total image count (denormalized) | Internal |
| `total_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Total storage size | Internal |
| `primary_image_type` | ENUM | No | `FRONT` | FRONT, BACK, MARKETING, PACKAGING | Which image type is primary | Internal |
| `primary_image_id` | UUID | No | NULL | FK to `file_attachments.id` | Primary image reference | Public |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.3 Image Items (Stored as `product_images` table)

Each image in the library:

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `library_id` | UUID | Yes | — | FK to `product_image_libraries.id` | Parent library | — |
| `image_type` | ENUM | Yes | — | FRONT, BACK, NUTRITION, INGREDIENTS, PACKAGING_ARTWORK, MARKETING, CERTIFICATE, MSDS, QC_REFERENCE, OTHER | Image type | Public |
| `file_attachment_id` | UUID | Yes | — | FK to `file_attachments.id` | File reference (per Ch 10 §10.12) | Internal |
| `image_url` | VARCHAR(500) | Yes | — | URL | Public URL (presigned or CDN) | Public |
| `thumbnail_url` | VARCHAR(500) | No | NULL | URL | Thumbnail URL | Public |
| `alt_text` | VARCHAR(200) | No | NULL | — | Alt text for accessibility | Public |
| `caption` | VARCHAR(200) | No | NULL | — | Image caption | Public |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `is_primary` | BOOLEAN | Yes | `false` | Only one primary per type | Primary image for its type | Internal |
| `is_customer_facing` | BOOLEAN | Yes | `false` | — | Visible to customers (POS, e-commerce) | Internal |
| `width_px` | INTEGER | No | NULL | > 0 | Image width | Internal |
| `height_px` | INTEGER | No | NULL | > 0 | Image height | Internal |
| `file_size_bytes` | BIGINT | No | NULL | > 0 | File size | Internal |
| `format` | ENUM | No | NULL | JPEG, PNG, WEBP, GIF, SVG | Image format | Internal |
| `artwork_version` | VARCHAR(20) | No | NULL | — | Artwork version (for packaging artwork) | Internal |
| `effective_from` | DATE | No | NULL | — | Effective dating | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective dating end | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| ImageLibrary → Product | 1 : 1 | `product_id` | CASCADE |
| ImageLibrary → Company | N : 1 | `company_id` | RESTRICT |
| ImageLibrary → FileAttachment (primary) | N : 1 | `primary_image_id` | SET NULL |
| ProductImage → ImageLibrary | N : 1 | `library_id` | CASCADE |
| ProductImage → FileAttachment | N : 1 | `file_attachment_id` | RESTRICT |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_product_image_libraries` | PK | `id` |
| `uq_image_lib_product` | UNIQUE | `product_id` (1:1) |
| `pk_product_images` | PK | `id` |
| `idx_images_library` | B-TREE | `library_id, display_order` |
| `idx_images_type` | B-TREE | `library_id, image_type` |
| `idx_images_primary` | PARTIAL | `library_id, image_type WHERE is_primary = true` |
| `idx_images_customer_facing` | PARTIAL | `library_id WHERE is_customer_facing = true` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `product_id` unique (1:1) | DB |
| 2 | Only one `is_primary = true` per (library_id, image_type) | App |
| 3 | `file_attachment_id` required | DB |
| 4 | `image_type` required | DB |
| 5 | `display_order` > 0 | DB |
| 6 | If `is_customer_facing = true`, image must pass content review (manual + AI) | App |
| 7 | File size ≤ 10 MB per image | App |
| 8 | Allowed formats: JPEG, PNG, WEBP, SVG only (no GIF for product images) | App |
| 9 | Minimum resolution for customer-facing: 800x800 px | App |
| 10 | `effective_to` > `effective_from` | DB CHECK |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/products/:id/images` (GET — list images), `/api/v1/products/:id/images` (POST — upload), `/api/v1/products/:id/images/:imageId` (PATCH — update metadata), `/api/v1/products/:id/images/:imageId` (DELETE — remove), `/api/v1/products/:id/images/primary/:type` (PUT — set primary by type) |
| **UI** | Image Gallery in product detail (grid view with type filter), Image Upload (drag-drop with preview), Image Editor (crop, rotate, caption), Customer-Facing Toggle, Artwork Version Manager |
| **Mobile** | Image capture (camera) for QC reference photos, view product images on scan, offline image cache |
| **Reports** | Image Coverage Report (products with/without images), Storage Usage Report, Customer-Facing Image Audit, Artwork Version Report |
| **Audit** | Full; mandatory reason for image deletion, is_customer_facing change, primary image change |

### 13-16. Security / AI / Performance / Example

**Security**: `image_url`, `thumbnail_url`, `alt_text`, `caption`, `image_type` = Public; `display_order`, `is_primary`, dimensions, file size = Internal; `is_customer_facing` = Internal (controls visibility).

**AI**: Image Recognition AI (auto-tagging image types), Content Moderation AI (for customer-facing images), Duplicate Detection AI, Artwork Compliance AI (checks FSSAI labeling compliance).

**Performance**: Images stored in object storage (not DB); only metadata in PostgreSQL; presigned URLs for client-side access; CDN for customer-facing images; thumbnails pre-generated on upload.

#### Example: Kaju Katli 500g Image Library

```json
{
  "library": {
    "id": "01928f7a-...-imglib-kaju-500",
    "code": "PRD-000123-IMG-LIB",
    "company_id": "01928f7a-...-company",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "library_name": "Kaju Katli 500g Image Library",
    "total_images": 6,
    "total_size_bytes": 8456320,
    "primary_image_type": "FRONT",
    "primary_image_id": "01928f7a-...-img-front",
    "status": "ACTIVE",
    "version": 1
  },
  "images": [
    {
      "id": "01928f7a-...-img-front",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "FRONT",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/front-v2.jpg",
      "thumbnail_url": "https://storage.sudhastar.com/products/kaju-katli-500/front-v2-thumb.jpg",
      "alt_text": "Kaju Katli 500g Premium Pack - Front View",
      "caption": "Premium Kaju Katli 500g",
      "display_order": 10,
      "is_primary": true,
      "is_customer_facing": true,
      "width_px": 1200,
      "height_px": 1200,
      "file_size_bytes": 1245680,
      "format": "JPEG",
      "artwork_version": "v2",
      "status": "ACTIVE"
    },
    {
      "id": "01928f7a-...-img-back",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "BACK",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/back-v2.jpg",
      "alt_text": "Kaju Katli 500g - Back View (Nutritional Info)",
      "display_order": 20,
      "is_primary": true,
      "is_customer_facing": false,
      "width_px": 1200,
      "height_px": 1200,
      "format": "JPEG",
      "artwork_version": "v2"
    },
    {
      "id": "01928f7a-...-img-nutrition",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "NUTRITION",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/nutrition-v2.jpg",
      "alt_text": "Nutritional Information",
      "display_order": 30,
      "is_primary": true,
      "is_customer_facing": true
    },
    {
      "id": "01928f7a-...-img-ingredients",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "INGREDIENTS",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/ingredients-v2.jpg",
      "alt_text": "Ingredients List",
      "display_order": 40,
      "is_primary": true,
      "is_customer_facing": true
    },
    {
      "id": "01928f7a-...-img-packaging",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "PACKAGING_ARTWORK",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/artwork-v2-source.svg",
      "alt_text": "Packaging Artwork Source File",
      "display_order": 50,
      "is_primary": true,
      "is_customer_facing": false,
      "format": "SVG",
      "artwork_version": "v2"
    },
    {
      "id": "01928f7a-...-img-marketing",
      "library_id": "01928f7a-...-imglib-kaju-500",
      "image_type": "MARKETING",
      "image_url": "https://storage.sudhastar.com/products/kaju-katli-500/marketing-festive.jpg",
      "alt_text": "Kaju Katli - Festive Season Marketing",
      "caption": "Perfect for festivals and celebrations",
      "display_order": 60,
      "is_primary": true,
      "is_customer_facing": true,
      "tags": ["festive", "marketing", "diwali"]
    }
  ]
}
```

---

## Part 3 Completion Summary

**All 10 Product Domain entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 011 Product Master | `11-product-master.md` | ✅ Complete |
| 012 Product Category | `12-14-classification-hierarchy.md` | ✅ Complete |
| 013 Product Sub Category | `12-14-classification-hierarchy.md` | ✅ Complete |
| 014 Product Family | `12-14-classification-hierarchy.md` | ✅ Complete |
| 015 Product Variant | `15-18-19-20-variant-packaging-barcode-imagelib.md` | ✅ Complete |
| 016 UOM Master | `16-17-measurement-foundation.md` | ✅ Complete |
| 017 UOM Conversion | `16-17-measurement-foundation.md` | ✅ Complete |
| 018 Packaging Master | `15-18-19-20-variant-packaging-barcode-imagelib.md` | ✅ Complete |
| 019 Barcode Master | `15-18-19-20-variant-packaging-barcode-imagelib.md` | ✅ Complete |
| 020 Product Image Library | `15-18-19-20-variant-packaging-barcode-imagelib.md` | ✅ Complete |

### Key Architectural Decisions in Part 3

1. **One Product = One SKU** — Variants are separate Product records linked via `product_family_id`, not multi-SKU single product
2. **3-level classification taxonomy** — Category → Sub-Category → Product Family → Product (variant)
3. **Global UOMs** — UOMs are platform-wide reference data, not company-scoped (ISO-standardized codes)
4. **UOM conversion types** — Global (fixed) + Product-specific (variable) conversions, both in same table
5. **Packaging hierarchy via self-reference** — `parent_packaging_id` + `quantity_per_parent` defines multi-level hierarchy
6. **Single Barcode Master** — All barcodes (product, batch, location, asset, pallet, etc.) in one table with `barcode_type` discriminator
7. **GS1 support from day one** — `gs1_gtin`, `gs1_company_prefix`, GS1-128 format for external-facing barcodes
8. **Damage tracking** — `damage_report_count`, `last_damage_reported_at` on Barcode (per Q103)
9. **POS sync tracking** — `is_pos_synced`, `pos_synced_at` for retail integration
10. **Image library per product** — 1:1 relationship, with image items categorized by type (FRONT, BACK, NUTRITION, INGREDIENTS, PACKAGING_ARTWORK, MARKETING, CERTIFICATE, MSDS, QC_REFERENCE)
11. **FSSAI compliance fields** — `allergens`, `ingredients`, `nutritional_info`, `fssai_license_no`, `is_veg`, `country_of_origin`, `manufacturer_*`, `packer_*` per Ch 18 §18.7
12. **AI-ready metadata** — Every product carries fields consumed by 15+ AI capabilities (demand forecast, inventory optimization, expiry prediction, etc.)
