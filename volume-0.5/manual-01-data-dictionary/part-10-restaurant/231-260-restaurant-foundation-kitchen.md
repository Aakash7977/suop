# Manual 1 · Part 10 · Sections 1-3 · Entities 231-260 — Restaurant Foundation, Menu/KOT/KDS & Kitchen Production

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 10 — Enterprise Restaurant Operations |
| Sections | 1 (Foundation), 2 (Menu/KOT/KDS), 3 (Kitchen Production) |
| Entities | 231–260 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §1.2, Ch 5 §5.7, Ch 5 §5.9, Ch 10 §10.5 |
| Last Updated | 2026-07-07 |

---

## Overview — Restaurant Operations Architecture

Part 10 implements the **Enterprise Restaurant Operations** domain — treating the restaurant as a "micro-manufacturing plant" with recipe-driven consumption, kitchen workflows, and unified inventory integration.

```
RESTAURANT MASTER (231) → AREAS (232) → TABLES (233) → SHIFTS (234) → STAFF (235-236) → DEVICES (237)
  ↓ Customer arrives
SEATING (238) / RESERVATION (239) → ORDER (245) → MENU (241-244) → KOT (247) → KDS (248) → ROUTING (249) → QUEUE (250)
  ↓ Kitchen executes
RECIPE CONSUMPTION (252) → KITCHEN INVENTORY (251) → PRODUCTION BATCH (253) → FOOD COST (255) → WASTAGE (256)
  ↓ Replenishment
TRANSFER (254) / REPLENISHMENT (257) / VERIFICATION (258) → COST ANALYSIS (259) → DASHBOARD (260)
```

### Unified Inventory Architecture (Per Chief Architect Recommendation)

**Already implemented**: Restaurant kitchen inventory is NOT a separate system — it's a scoped view of the **Enterprise Inventory Ledger** (Entity 022). When a customer orders Paneer Butter Masala:

```
Order → Recipe Loaded → Recipe Consumption (252) → Kitchen Inventory (251) decremented
  → Enterprise Inventory Ledger (022) ISSUE entry written
  → Stock Summary (021) updated
  → Replenishment triggered if below reorder point
  → Warehouse transfer suggested
  → Manufacturing demand updated
```

**One source of truth** across Warehouse, Manufacturing, Retail, and Restaurant.

### Integrated Enhancements
1. **Restaurant 2.0** — IoT kitchen, smart scales, voice chef, temperature monitoring
2. **AI Kitchen Copilot** — Bottleneck prediction, chef workload balancing, prep sequence optimization
3. **Enterprise Kitchen 4.0** — Predictive ingredient demand, batch cooking optimization, dynamic menu pricing
4. **Restaurant Digital Twin** — Tables, kitchen, customers, orders, inventory, staff modeled digitally

---

## Entity 231 — Restaurant Master

### 1. Business Purpose
Represents restaurant outlets. Per Part 10: *"Restaurant Code immutable. Restaurant cannot be deleted."* Types: Quick Service, Casual Dining, Fine Dining, Cloud Kitchen, Food Court, Bakery, Cafe, Sweet Shop.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `RST-` | Restaurant code (immutable per Part 10) | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` (OUTLET type) | Linked facility | Internal |
| `restaurant_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 10) | Public |
| `restaurant_type` | ENUM | Yes | — | QUICK_SERVICE, CASUAL_DINING, FINE_DINING, CLOUD_KITCHEN, FOOD_COURT, BAKERY, CAFE, SWEET_SHOP (per Part 10) | Type | Internal |
| `manager_user_id` | UUID | Yes | — | FK to `user_accounts` | Manager (per Part 10) | Internal |
| `region_id` | UUID | No | NULL | — | Region | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | IANA | Timezone (per Part 10) | Public |
| `business_hours` | JSONB | Yes | `'{}'` | — | Hours: `[{ day, open, close, is_closed }]` (per Part 10) | Public |
| `address` | JSONB | Yes | `'{}'` | — | Location (per Part 10) | Internal |
| `latitude` | DECIMAL(10,7) | No | NULL | — | GPS lat | Internal |
| `longitude` | DECIMAL(10,7) | No | NULL | — | GPS long | Internal |
| `phone` | VARCHAR(20) | No | NULL | E.164 | Phone | Public |
| `email` | VARCHAR(200) | No | NULL | Email | Email | Public |
| `total_tables` | INTEGER | Yes | `0` | ≥ 0 | Total tables | Internal |
| `total_seating_capacity` | INTEGER | Yes | `0` | ≥ 0 | Seating capacity | Internal |
| `kitchen_count` | INTEGER | Yes | `1` | ≥ 1 | Number of kitchens | Internal |
| `pos_terminal_count` | INTEGER | Yes | `0` | ≥ 0 | POS terminals | Internal |
| `has_delivery` | BOOLEAN | Yes | `false` | — | Delivery capable | Internal |
| `has_qr_ordering` | BOOLEAN | Yes | `false` | — | QR ordering enabled (per Part 10) | Internal |
| `has_online_ordering` | BOOLEAN | Yes | `false` | — | Online ordering | Internal |
| `digital_twin_enabled` | BOOLEAN | Yes | `false` | — | Digital Twin (per Enhancement) | Internal |
| `iot_kitchen_enabled` | BOOLEAN | Yes | `false` | — | IoT kitchen (per Enhancement) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, RENOVATION, CLOSED | Status (per Part 10) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 232 — Restaurant Area

### 1. Business Purpose
Logical customer areas. Per Part 10: Main Hall, VIP, Outdoor, Private Dining, Family Area, Waiting Area, Takeaway Counter.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Parent restaurant | Internal |
| `area_code` | VARCHAR(20) | Yes | — | Unique per restaurant | Area code | Internal |
| `area_name` | VARCHAR(100) | Yes | — | Min 2 | Display name (per Part 10) | Public |
| `area_type` | ENUM | Yes | `MAIN_HALL` | MAIN_HALL, VIP, OUTDOOR, PRIVATE_DINING, FAMILY_AREA, WAITING_AREA, TAKEAWAY_COUNTER (per Part 10) | Type | Internal |
| `table_count` | INTEGER | Yes | `0` | ≥ 0 | Tables in area | Internal |
| `seating_capacity` | INTEGER | Yes | `0` | ≥ 0 | Total seats | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 233 — Table Master

### 1. Business Purpose
Dining table management. Per Part 10: Status — Available, Reserved, Occupied, Cleaning, Blocked. Supports QR ordering.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Parent restaurant | Internal |
| `area_id` | UUID | Yes | — | FK to `restaurant_areas` | Area (per Part 10) | Internal |
| `table_number` | VARCHAR(20) | Yes | — | Unique per restaurant | Table number (per Part 10) | Public |
| `table_name` | VARCHAR(100) | No | NULL | — | Display name | Public |
| `capacity` | INTEGER | Yes | `4` | > 0 | Seating capacity (per Part 10) | Internal |
| `qr_code_value` | VARCHAR(100) | No | NULL | Generated | QR code for ordering (per Part 10: "QR Code") | Public |
| `current_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, RESERVED, OCCUPIED, CLEANING, BLOCKED (per Part 10) | Live status | Internal |
| `current_waiter_id` | UUID | No | NULL | FK to `user_accounts` | Assigned waiter (per Part 10: "Waiter") | Internal |
| `current_order_id` | UUID | No | NULL | FK to `restaurant_orders` | Active order | Internal |
| `occupied_at` | TIMESTAMPTZ | No | NULL | — | When occupied | Internal |
| `guests_seated` | INTEGER | No | NULL | ≥ 0 | Current guests | Internal |
| `is_combinable` | BOOLEAN | Yes | `true` | — | Can combine tables | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 234 — Restaurant Shift

### 1. Business Purpose
Daily operations. Per Part 10: Shift, Manager, Cashier, Opening Time, Closing Time, Opening Cash, Closing Cash, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `shift_number` | VARCHAR(50) | Yes | — | Unique per restaurant+date | Display (per Part 10) | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `shift_type` | ENUM | Yes | — | MORNING, EVENING, NIGHT, FULL_DAY, SPLIT | Type | Internal |
| `manager_user_id` | UUID | Yes | — | FK to `user_accounts` | Manager (per Part 10) | Internal |
| `cashier_user_id` | UUID | No | NULL | FK to `user_accounts` | Cashier (per Part 10) | Internal |
| `shift_date` | DATE | Yes | `CURRENT_DATE` | — | Shift date | Internal |
| `opening_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Opening (per Part 10) | Internal |
| `closing_time` | TIMESTAMPTZ | No | NULL | — | Closing (per Part 10) | Internal |
| `opening_cash` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Opening cash (per Part 10) | Confidential |
| `closing_cash` | DECIMAL(18,4) | No | NULL | ≥ 0 | Closing cash (per Part 10) | Confidential |
| `cash_difference` | DECIMAL(18,4) | No | NULL | — | Difference | Confidential |
| `total_sales` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Shift sales | Confidential |
| `total_orders` | INTEGER | Yes | `0` | ≥ 0 | Orders processed | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, CLOSED, SUSPENDED | Status (per Part 10) | Internal |

---

## Entity 235 — Waiter Master

### 1. Business Purpose
Restaurant staff. Per Part 10: Employee, Section, Shift, Performance, Status. Supports multi-section assignment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `employee_id` | UUID | Yes | — | FK to `employees` | Linked employee | Internal |
| `assigned_sections` | UUID[] | Yes | `ARRAY[]::UUID[]` | FK array to `restaurant_areas` | Multi-section (per Part 10) | Internal |
| `shift_id` | UUID | No | NULL | FK to `restaurant_shifts` | Current shift | Internal |
| `performance_score` | DECIMAL(5,2) | No | NULL | 0-100 | Performance (per Part 10) | Internal |
| `total_tables_served` | INTEGER | Yes | `0` | ≥ 0 | Career tables served | Internal |
| `total_orders_taken` | INTEGER | Yes | `0` | ≥ 0 | Career orders | Internal |
| `avg_tip_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Avg tip | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ON_BREAK, OFF_DUTY, INACTIVE | Status (per Part 10) | Internal |

---

## Entity 236 — Restaurant Station

### 1. Business Purpose
Operational workstations. Per Part 10: Cashier, Kitchen, Dessert, Beverage, Packing, Dispatch, Delivery.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `station_code` | VARCHAR(20) | Yes | — | Unique per restaurant | Station code | Internal |
| `station_name` | VARCHAR(100) | Yes | — | Min 2 | Display name | Public |
| `station_type` | ENUM | Yes | — | CASHIER, KITCHEN, DESSERT, BEVERAGE, PACKING, DISPATCH, DELIVERY (per Part 10) | Type | Internal |
| `assigned_staff_id` | UUID | No | NULL | FK to `user_accounts` | Current assignee | Internal |
| `kds_screen_id` | UUID | No | NULL | FK to `kds_displays` | KDS screen (per Part 10) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 237 — Restaurant Device

### 1. Business Purpose
Connected hardware. Per Part 10: KDS Screen, Kitchen Printer, Receipt Printer, Barcode Scanner, QR Scanner, Customer Display, Tablet, Handheld POS.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `device_code` | VARCHAR(30) | Yes | — | Unique per restaurant | Code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `device_type` | ENUM | Yes | — | KDS_SCREEN, KITCHEN_PRINTER, RECEIPT_PRINTER, BARCODE_SCANNER, QR_SCANNER, CUSTOMER_DISPLAY, TABLET, HANDHELD_POS (per Part 10) | Type | Internal |
| `device_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Public |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | — | IP | Internal |
| `station_id` | UUID | No | NULL | FK to `restaurant_stations` | Assigned station | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, OFFLINE, MAINTENANCE | Status | Internal |

---

## Entity 238 — Customer Seating

### 1. Business Purpose
Tracks customer seating. Per Part 10: Party Size, Arrival Time, Wait Time, Assigned Table, Waiter, Status. AI: Wait Time Prediction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `party_size` | INTEGER | Yes | — | > 0 | Guests (per Part 10: "Party Size") | Internal | |
| `arrival_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Arrival (per Part 10) | Internal | |
| `wait_time_min` | INTEGER | No | NULL | ≥ 0 | Actual wait (per Part 10: "Wait Time") | Internal | |
| `assigned_table_id` | UUID | No | NULL | FK to `table_masters` | Table (per Part 10) | Internal | |
| `assigned_waiter_id` | UUID | No | NULL | FK to `user_accounts` | Waiter (per Part 10) | Internal | |
| `predicted_wait_min` | INTEGER | No | NULL | ≥ 0 | AI predicted wait (per Part 10 AI) | Internal | Wait AI |
| `dining_time_min` | INTEGER | No | NULL | ≥ 0 | Actual dining time | Internal | |
| `status` | ENUM | Yes | `WAITING` | WAITING, SEATED, DINING, COMPLETED, LEFT | Status (per Part 10) | Internal | |

---

## Entity 239 — Reservation

### 1. Business Purpose
Table reservations. Per Part 10: Reservation Number, Customer, Guests, Table, Booking Time, Arrival Time, Status. Sources: Phone, Website, Mobile App, Walk-in.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `reservation_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 10) | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Customer (per Part 10) | Confidential |
| `customer_name` | VARCHAR(200) | Yes | — | Min 2 | Name | Internal |
| `customer_phone` | VARCHAR(20) | Yes | — | E.164 | Phone | Confidential |
| `guests_count` | INTEGER | Yes | — | > 0 | Guest count (per Part 10: "Guests") | Internal |
| `table_id` | UUID | No | NULL | FK to `table_masters` | Assigned table (per Part 10: "Table") | Internal |
| `booking_time` | TIMESTAMPTZ | Yes | — | — | Booking time (per Part 10) | Internal |
| `arrival_time` | TIMESTAMPTZ | No | NULL | — | Actual arrival (per Part 10) | Internal |
| `reservation_source` | ENUM | Yes | `PHONE` | PHONE, WEBSITE, MOBILE_APP, WALK_IN (per Part 10) | Source | Internal |
| `special_requests` | TEXT | No | NULL | — | Special requests | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, CONFIRMED, ARRIVED, NO_SHOW, CANCELLED, COMPLETED | Status (per Part 10) | Internal |

---

## Entity 240 — Restaurant Dashboard

### 1. Business Purpose
Per Part 10: Occupied Tables, Waiting Customers, Average Wait, Average Dining Time, Table Turnover, Open Orders, Kitchen Load, Revenue Today.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `occupied_tables` | INTEGER | Yes | `0` | ≥ 0 | Occupied (per Part 10) | Internal |
| `waiting_customers` | INTEGER | Yes | `0` | ≥ 0 | Waiting (per Part 10) | Internal |
| `avg_wait_min` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Avg wait (per Part 10) | Internal |
| `avg_dining_time_min` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Avg dining (per Part 10) | Internal |
| `table_turnover_count` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Turnover (per Part 10) | Internal |
| `open_orders` | INTEGER | Yes | `0` | ≥ 0 | Open orders (per Part 10) | Internal |
| `kitchen_load_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Kitchen load (per Part 10) | Internal |
| `revenue_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Revenue (per Part 10) | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI restaurant insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 241 — Menu Master

### 1. Business Purpose
Stores every menu item. Per Part 10: Links to Recipe (Entity 061), selling price, preparation time, availability.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `menu_code` | VARCHAR(30) | Yes | — | Unique per company, `MENU-` | Menu code (per Part 10) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `menu_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 10) | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `category_id` | UUID | Yes | — | FK to `menu_categories` (Entity 242) | Category (per Part 10) | Internal |
| `recipe_id` | UUID | Yes | — | FK to `recipes` (Entity 061) | Linked recipe (per Part 10: "recipe_id") — drives consumption | Confidential |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions` (Entity 062) | Specific version (immutable trace) | Confidential |
| `selling_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Price (per Part 10) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `tax_group_id` | UUID | Yes | — | FK to `tax_codes` | Tax group (per Part 10) | Confidential |
| `preparation_time_min` | INTEGER | Yes | `15` | > 0 | Prep time (per Part 10) | Internal |
| `availability` | ENUM | Yes | `AVAILABLE` | AVAILABLE, UNAVAILABLE, SEASONAL, LIMITED, PRE_ORDER (per Part 10) | Availability (per Part 10) | Internal |
| `is_veg` | BOOLEAN | Yes | `true` | — | Veg/Non-veg | Public |
| `allergens` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Allergen tags | Public |
| `image_file_id` | UUID | No | NULL | FK to `file_attachments` | Menu image | Public |
| `spice_level` | ENUM | No | NULL | MILD, MEDIUM, HOT, EXTRA_HOT | Spice level | Public |
| `is_combo` | BOOLEAN | Yes | `false` | — | Part of combo | Internal |
| `combo_id` | UUID | No | NULL | FK to `combo_meals` (Entity 244) | Parent combo | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 242 — Menu Category

### 1. Business Purpose
Per Part 10: Starter, Main Course, South Indian, North Indian, Chinese, Dessert, Beverages, Bakery, Sweets, Combo Meals.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 10) | Public |
| `parent_category_id` | UUID | No | NULL | FK self-ref | Parent (hierarchy) | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 243 — Menu Modifier

### 1. Business Purpose
Customizations. Per Part 10: Extra Cheese, Less Sugar, No Onion, Extra Spicy, Without Butter, Large Size, Small Size. Supports price + recipe adjustment.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `menu_id` | UUID | Yes | — | FK to `menu_masters` | Applicable menu item | Internal |
| `modifier_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 10) | Public |
| `modifier_type` | ENUM | Yes | — | ADDON, REMOVAL, SIZE, SPICE_LEVEL, CUSTOM | Type | Internal |
| `price_adjustment` | DECIMAL(18,4) | Yes | `0` | — | Price change (per Part 10: "Price adjustment") | Confidential |
| `recipe_adjustment` | JSONB | No | NULL | — | Ingredient change (per Part 10: "Recipe adjustment") | Confidential |
| `is_default` | BOOLEAN | Yes | `false` | — | Default selected | Internal |
| `is_mandatory_choice` | BOOLEAN | Yes | `false` | — | Must choose (e.g., size) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 244 — Combo Meal

### 1. Business Purpose
Combo products. Per Part 10: Fixed Combo, Custom Combo, Meal Upgrade. Example: Burger + Fries + Cold Drink.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `combo_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `combo_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 10) | Public |
| `combo_type` | ENUM | Yes | `FIXED` | FIXED, CUSTOM, MEAL_UPGRADE (per Part 10) | Type | Internal |
| `total_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Combo price | Confidential |
| `individual_price_total` | DECIMAL(18,4) | Yes | — | ≥ 0 | Sum of individual prices | Confidential |
| `savings_amount` | DECIMAL(18,4) | No | — | Generated: `individual - combo` | Customer savings | Confidential |
| `menu_item_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | FK array to `menu_masters` | Included items (per Part 10) | Internal |
| `is_customizable` | BOOLEAN | Yes | `false` | — | Custom combo (per Part 10: "Custom Combo") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 245 — Restaurant Order

### 1. Business Purpose
Customer order. Per Part 10 sources: Table, QR, Waiter, Takeaway, Delivery, Website, Mobile App, Marketplace. Status: Draft → Confirmed → Preparing → Ready → Served → Completed → Cancelled.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 10) | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `order_source` | ENUM | Yes | — | TABLE, QR, WAITER, TAKEAWAY, DELIVERY, WEBSITE, MOBILE_APP, MARKETPLACE (per Part 10) | Source (per Part 10) | Internal |
| `table_id` | UUID | No | NULL | FK to `table_masters` | Dining table (if dine-in) | Internal |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Customer | Confidential |
| `waiter_user_id` | UUID | No | NULL | FK to `user_accounts` | Waiter | Internal |
| `shift_id` | UUID | No | NULL | FK to `restaurant_shifts` | Shift | Internal |
| `order_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `order_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Time | Internal |
| `subtotal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Pre-discount | Confidential |
| `discount_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Discount | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax | Confidential |
| `packaging_charge` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Packaging | Confidential |
| `service_charge` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Service | Confidential |
| `grand_total` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PAID, PARTIAL, REFUNDED | Payment | Internal |
| `order_status` | ENUM | Yes | `DRAFT` | DRAFT, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED (per Part 10) | Status (per Part 10) | Internal |
| `kot_id` | UUID | No | NULL | FK to `kots` (Entity 247) | Kitchen ticket | Internal |
| `is_online_order` | BOOLEAN | Yes | `false` | — | From online channel | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory ledger entries (ISSUE type) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 246 — Order Line Item

### 1. Business Purpose
Stores ordered items. Per Part 10: Order, Menu, Quantity, Modifiers, Special Instruction, Course, Priority, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_id` | UUID | Yes | — | FK to `restaurant_orders` | Parent order | Internal |
| `line_number` | INTEGER | Yes | — | > 0, unique per order | Line number | Internal |
| `menu_id` | UUID | Yes | — | FK to `menu_masters` | Menu item (per Part 10: "Menu") | Internal |
| `menu_name` | VARCHAR(200) | No | NULL | Denormalized | Name | Public |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity (per Part 10) | Internal |
| `unit_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Unit price | Confidential |
| `modifier_ids` | UUID[] | No | `ARRAY[]::UUID[]` | FK array to `menu_modifiers` | Modifiers (per Part 10: "Modifiers") | Internal |
| `modifier_price_adjustment` | DECIMAL(18,4) | Yes | `0` | — | Price change from modifiers | Confidential |
| `line_total` | DECIMAL(18,4) | Yes | — | ≥ 0 | `qty * (unit_price + modifier_adj)` | Confidential |
| `special_instructions` | TEXT | No | NULL | — | Special instructions (per Part 10) | Internal |
| `course_number` | INTEGER | No | `1` | ≥ 1 | Course sequence (per Part 10: "Course") | Internal |
| `priority` | ENUM | Yes | `NORMAL` | VIP, RUSH, NORMAL, SCHEDULED (per Part 10: "Priority") | Priority | Internal |
| `kot_line_id` | UUID | No | NULL | FK to `kot_lines` | KOT line reference | Internal |
| `line_status` | ENUM | Yes | `PENDING` | PENDING, PREPARING, READY, SERVED, CANCELLED | Status (per Part 10) | Internal |

---

## Entity 247 — Kitchen Order Ticket (KOT)

### 1. Business Purpose
Kitchen production instruction. Per Part 10 lifecycle: Order → KOT → Kitchen → Chef → Ready → Served. Priority: VIP, Rush, Normal, Scheduled.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kot_number` | VARCHAR(50) | Yes | — | Unique per restaurant+date | Display (per Part 10: "KOT Number") | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `order_id` | UUID | Yes | — | FK to `restaurant_orders` | Parent order | Internal |
| `kitchen_id` | UUID | Yes | — | FK to `restaurant_stations` (KITCHEN type) | Kitchen (per Part 10: "Kitchen") | Internal |
| `station_id` | UUID | No | NULL | FK to `restaurant_stations` | Specific station (per Part 10: "Station") | Internal |
| `chef_user_id` | UUID | No | NULL | FK to `user_accounts` | Assigned chef (per Part 10: "Chef") | Internal |
| `priority` | ENUM | Yes | `NORMAL` | VIP, RUSH, NORMAL, SCHEDULED (per Part 10: "Priority") | Priority | Internal |
| `kot_status` | ENUM | Yes | `PENDING` | PENDING, QUEUED, IN_PROGRESS, READY, SERVED, CANCELLED | Status (per Part 10: "Status") | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Total items | Internal |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | KOT creation | Internal |
| `accepted_at` | TIMESTAMPTZ | No | NULL | — | Chef accepted | Internal |
| `ready_at` | TIMESTAMPTZ | No | NULL | — | Food ready | Internal |
| `served_at` | TIMESTAMPTZ | No | NULL | — | Served to customer | Internal |
| `preparation_time_min` | INTEGER | No | NULL | ≥ 0 | Actual prep time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |

---

## Entity 248 — Kitchen Display System (KDS)

### 1. Business Purpose
Digital kitchen screen. Per Part 10: Active Orders, Waiting, Cooking, Delayed, Completed, Chef Queue, Station Load. Supports Touch, Color Coding, Sound Alerts.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kds_code` | VARCHAR(30) | Yes | — | Unique per restaurant | Display code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `kitchen_id` | UUID | Yes | — | FK to `restaurant_stations` | Kitchen | Internal |
| `device_id` | UUID | No | NULL | FK to `restaurant_devices` | Physical screen | Internal |
| `display_configuration` | JSONB | Yes | `'{}'` | — | Layout, colors, sound alerts (per Part 10) | Internal |
| `active_kots_count` | INTEGER | Yes | `0` | ≥ 0 | Active KOTs (per Part 10: "Active Orders") | Internal |
| `delayed_kots_count` | INTEGER | Yes | `0` | ≥ 0 | Delayed (per Part 10: "Delayed Orders") | Internal |
| `avg_preparation_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Avg prep time | Internal |
| `station_load_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Station load (per Part 10: "Station Load") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 249 — Kitchen Routing

### 1. Business Purpose
Routes items automatically. Per Part 10: Pizza → Pizza Station, Coffee → Beverage Station, Dessert → Dessert Station. *"Automatic routing. Multi-station support."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `routing_code` | VARCHAR(30) | Yes | — | Unique per restaurant | Code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `menu_id` | UUID | Yes | — | FK to `menu_masters` | Menu item to route (per Part 10) | Internal |
| `destination_station_id` | UUID | Yes | — | FK to `restaurant_stations` | Target station (per Part 10) | Internal |
| `secondary_station_id` | UUID | No | NULL | FK to `restaurant_stations` | Secondary (per Part 10: "Multi-station support") | Internal |
| `routing_priority` | INTEGER | Yes | `100` | > 0 | Routing priority | Internal |
| `is_automatic` | BOOLEAN | Yes | `true` | — | Auto-routing (per Part 10: "Automatic routing") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 250 — Kitchen Queue

### 1. Business Purpose
Chef work queue. Per Part 10: FIFO, Priority, VIP, Delivery Time, Course Sequence. AI: Dynamic queue optimization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `kitchen_id` | UUID | Yes | — | FK to `restaurant_stations` | Kitchen | Internal | |
| `kot_id` | UUID | Yes | — | FK to `kots` | KOT in queue (per Part 10) | Internal | |
| `queue_position` | INTEGER | Yes | — | > 0 | Position (per Part 10: "FIFO") | Internal | Queue AI |
| `queue_priority` | ENUM | Yes | `NORMAL` | FIFO, PRIORITY, VIP, DELIVERY_TIME, COURSE_SEQUENCE (per Part 10) | Priority rule | Internal | Queue AI |
| `estimated_prep_time_min` | INTEGER | Yes | — | > 0 | Estimated prep | Internal | |
| `ai_optimized_position` | INTEGER | No | NULL | ≥ 1 | AI-suggested position (per Part 10 AI) | Internal | Queue AI |
| `is_ai_optimized` | BOOLEAN | Yes | `false` | — | AI optimized queue (per Part 10: "Dynamic queue optimization") | Internal | |
| `status` | ENUM | Yes | `QUEUED` | QUEUED, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal | |

---

## Entity 251 — Kitchen Inventory

### 1. Business Purpose
Represents inventory available inside the kitchen. Per Part 10: *"Derived from Enterprise Inventory Ledger. Cannot manually modify quantities."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` (per Part 10: "restaurant_id") | Restaurant/kitchen | Internal |
| `ingredient_id` | UUID | Yes | — | FK to `products` (RAW_MATERIAL) | Ingredient (per Part 10: "ingredient_id") | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch (per Part 10: "batch_id") | Internal |
| `available_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Available (per Part 10: "available_qty") | Internal |
| `reserved_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Reserved | Internal |
| `expiry_date` | DATE | No | NULL | — | Expiry (per Part 10: "expiry_date") | Public |
| `storage_location` | UUID | No | NULL | FK to `locations` | Kitchen storage (per Part 10: "storage_location") | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `stock_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, LOW_STOCK, OUT_OF_STOCK, EXPIRED | Status (per Part 10: "status") | Internal |
| `last_consumption_at` | TIMESTAMPTZ | No | NULL | — | Last ingredient used | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

**Note**: Kitchen Inventory is a scoped view of `inventory_master` (Entity 021) filtered by `facility_id = restaurant_id`. All writes go through the Enterprise Inventory Ledger (Entity 022).

---

## Entity 252 — Recipe Consumption

### 1. Business Purpose
Automatically deducts ingredients. Per Part 10: *"Consumption begins when KOT enters PREPARING."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `consumption_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `order_id` | UUID | Yes | — | FK to `restaurant_orders` | Source order (per Part 10: "Restaurant Order") | Internal |
| `kot_id` | UUID | Yes | — | FK to `kots` | Source KOT | Internal |
| `recipe_id` | UUID | Yes | — | FK to `recipes` | Recipe consumed (per Part 10: "Recipe") | Confidential |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions` | Specific version | Confidential |
| `ingredient_id` | UUID | Yes | — | FK to `products` | Ingredient (per Part 10: "Ingredient") | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch consumed (FEFO) | Internal |
| `expected_qty` | DECIMAL(18,4) | Yes | — | > 0 | Expected from recipe (per Part 10: "Expected Qty") | Internal |
| `actual_qty` | DECIMAL(18,4) | Yes | — | > 0 | Actual consumed (per Part 10: "Actual Qty") | Internal |
| `variance_qty` | DECIMAL(18,4) | No | — | Generated: `actual - expected` | Variance (per Part 10: "Variance") | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Operator (per Part 10: "Operator") | Internal |
| `consumption_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Time (per Part 10: "Consumption Time") | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | ISSUE ledger entry (Unified Inventory) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 253 — Kitchen Production Batch

### 1. Business Purpose
Tracks prepared food batches. Per Part 10: Tea, Coffee, Sambar, Chutney, Gravy, Sauce, Sweet Syrup.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `batch_number` | VARCHAR(50) | Yes | — | Unique per restaurant+date | Display (per Part 10: "Batch Number") | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `recipe_id` | UUID | Yes | — | FK to `recipes` | Recipe (per Part 10: "Recipe") | Confidential |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions` | Version | Confidential |
| `produced_qty` | DECIMAL(18,4) | Yes | — | > 0 | Produced (per Part 10: "Produced Qty") | Internal |
| `consumed_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Consumed (per Part 10: "Consumed Qty") | Internal |
| `remaining_qty` | DECIMAL(18,4) | No | — | Generated: `produced - consumed` | Remaining (per Part 10: "Remaining Qty") | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `manufacturing_date` | DATE | Yes | `CURRENT_DATE` | — | Prep date | Internal |
| `expiry_date` | DATE | Yes | — | > manufacturing_date | Expiry (per Part 10: "Expiry") | Public |
| `chef_user_id` | UUID | Yes | — | FK to `user_accounts` | Preparing chef | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CONSUMED, EXPIRED, WASTED | Status (per Part 10: "Status") | Internal |

---

## Entity 254 — Kitchen Transfer

### 1. Business Purpose
Transfers inventory. Per Part 10: Warehouse → Kitchen, Kitchen → Counter, Kitchen → Waste, Kitchen → Production.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `transfer_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `transfer_type` | ENUM | Yes | — | WAREHOUSE_TO_KITCHEN, KITCHEN_TO_COUNTER, KITCHEN_TO_WASTE, KITCHEN_TO_PRODUCTION (per Part 10) | Type | Internal |
| `source_facility_id` | UUID | Yes | — | FK to `facilities` | Source (per Part 10) | Internal |
| `destination_facility_id` | UUID | Yes | — | FK to `facilities` | Destination | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Item transferred | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Transfer qty | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `ledger_entry_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | TRANSFER_OUT + TRANSFER_IN ledger entries | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, DISPATCHED, RECEIVED, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 255 — Food Cost

### 1. Business Purpose
Calculates actual food cost. Per Part 10: Ingredients, Packaging, Gas, Electricity, Labor, Utility, Overhead. Stores Standard, Actual, Variance, Food Cost %.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `menu_id` | UUID | Yes | — | FK to `menu_masters` | Menu item | Internal |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions` | Recipe version | Confidential |
| `ingredient_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Ingredients (per Part 10: "Ingredients") | Confidential |
| `packaging_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Packaging (per Part 10: "Packaging") | Confidential |
| `gas_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Gas (per Part 10: "Gas") | Confidential |
| `electricity_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Electricity (per Part 10: "Electricity") | Confidential |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor (per Part 10: "Labor") | Confidential |
| `utility_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utility (per Part 10: "Utility") | Confidential |
| `overhead_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overhead (per Part 10: "Overhead") | Confidential |
| `standard_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Standard total (per Part 10: "Standard Cost") | Confidential |
| `actual_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Actual total (per Part 10: "Actual Cost") | Confidential |
| `variance` | DECIMAL(18,4) | No | — | Generated: `actual - standard` | Variance (per Part 10: "Variance") | Confidential |
| `selling_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Menu price | Confidential |
| `food_cost_pct` | DECIMAL(5,2) | No | — | Generated: `(actual_cost / selling_price) * 100` | Food Cost % (per Part 10: "Food Cost %") | Confidential |
| `gross_margin_pct` | DECIMAL(5,2) | No | — | Generated: `100 - food_cost_pct` | Margin | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 256 — Kitchen Wastage

### 1. Business Purpose
Tracks food loss. Per Part 10 reasons: Over Production, Burnt, Expired, Preparation Error, Customer Return, Spillage, Cleaning. *"Approval required above tolerance."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `wastage_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `waste_type` | ENUM | Yes | — | OVER_PRODUCTION, BURNT, EXPIRED, PREPARATION_ERROR, CUSTOMER_RETURN, SPILLAGE, CLEANING (per Part 10) | Reason (per Part 10: "Reasons") | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Wasted item | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Wasted qty | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `cost_impact` | DECIMAL(18,4) | Yes | — | ≥ 0 | Financial impact | Confidential |
| `reason_details` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `reported_by` | UUID | Yes | — | FK to `user_accounts` | Reporter | Internal |
| `reported_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Time | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approval (per Part 10: "Approval required above tolerance") | Confidential |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | SCRAP ledger entry | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, COMPLETED, REJECTED | Status | Internal |

---

## Entity 257 — Ingredient Replenishment

### 1. Business Purpose
Restocks kitchen inventory. Per Part 10: Minimum Level → Automatic Task → Warehouse → Kitchen. Supports AI recommendations.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `replenishment_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `ingredient_id` | UUID | Yes | — | FK to `products` | Ingredient to restock | Internal | |
| `current_qty` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current stock | Internal | |
| `minimum_level` | DECIMAL(18,4) | Yes | — | ≥ 0 | Reorder trigger (per Part 10: "Minimum Level") | Internal | |
| `recommended_qty` | DECIMAL(18,4) | Yes | — | > 0 | Replenishment qty | Internal | Replenishment AI |
| `source_warehouse_id` | UUID | Yes | — | FK to `facilities` | Source warehouse (per Part 10: "Warehouse") | Internal | |
| `is_ai_generated` | BOOLEAN | Yes | `false` | — | AI recommended (per Part 10: "Supports AI recommendations") | Internal | Replenishment AI |
| `ai_confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal | |
| `transfer_id` | UUID | No | NULL | FK to `kitchen_transfers` | Generated transfer | Internal | |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, DISPATCHED, RECEIVED, COMPLETED, CANCELLED | Status | Internal | |

---

## Entity 258 — Kitchen Stock Verification

### 1. Business Purpose
Daily stock validation. Per Part 10: Opening Stock, Closing Stock, Cycle Count, Variance, Expiry Verification, Barcode Scan.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `verification_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `verification_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `verification_type` | ENUM | Yes | `CLOSING` | OPENING, CLOSING, CYCLE_COUNT (per Part 10) | Type | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Items verified | Internal |
| `variance_items` | INTEGER | Yes | `0` | ≥ 0 | Items with variance (per Part 10: "Variance") | Internal |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Accuracy | Internal |
| `barcode_scan_used` | BOOLEAN | Yes | `true` | — | Barcode scan (per Part 10: "Barcode Scan") | Internal |
| `expiry_checked` | BOOLEAN | Yes | `true` | — | Expiry verification (per Part 10: "Expiry Verification") | Internal |
| `verified_by` | UUID | Yes | — | FK to `user_accounts` | Verifier | Internal |
| `verified_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Verification time | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal |

---

## Entity 259 — Food Cost Analysis

### 1. Business Purpose
Analyzes profitability. Per Part 10: Cost %, Selling Price, Gross Margin, Contribution Margin, Waste Cost, Ingredient Cost. AI: Cost optimization.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `analysis_date` | DATE | Yes | — | — | Analysis date | Internal | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `menu_id` | UUID | Yes | — | FK to `menu_masters` | Menu item | Internal | |
| `cost_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Cost % (per Part 10: "Cost %") | Confidential | Cost AI |
| `selling_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Selling price (per Part 10: "Selling Price") | Confidential | |
| `gross_margin` | DECIMAL(18,4) | Yes | — | — | Gross margin (per Part 10: "Gross Margin") | Confidential | |
| `contribution_margin` | DECIMAL(18,4) | Yes | — | — | Contribution (per Part 10: "Contribution Margin") | Confidential | |
| `waste_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Waste cost (per Part 10: "Waste Cost") | Confidential | |
| `ingredient_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Ingredient cost (per Part 10: "Ingredient Cost") | Confidential | |
| `profitability_rating` | ENUM | Yes | `MEDIUM` | HIGH, MEDIUM, LOW, LOSS | Rating | Confidential | |
| `ai_optimization_suggestion` | TEXT | No | NULL | — | AI cost optimization (per Part 10 AI) | Internal | Cost AI |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal | |

---

## Entity 260 — Kitchen Dashboard

### 1. Business Purpose
Per Part 10: Kitchen Orders, Kitchen Inventory, Low Stock, Food Cost, Waste %, Recipe Variance, Production Status, Chef Productivity.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `kitchen_orders_active` | INTEGER | Yes | `0` | ≥ 0 | Active orders (per Part 10: "Kitchen Orders") | Internal |
| `kitchen_inventory_health_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Inventory health (per Part 10: "Kitchen Inventory") | Internal |
| `low_stock_count` | INTEGER | Yes | `0` | ≥ 0 | Low stock items (per Part 10: "Low Stock") | Internal |
| `food_cost_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Food cost (per Part 10: "Food Cost") | Confidential |
| `waste_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Waste (per Part 10: "Waste %") | Internal |
| `recipe_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Recipe variance (per Part 10: "Recipe Variance") | Internal |
| `production_status` | ENUM | Yes | `NORMAL` | NORMAL, BUSY, RUSH, OVERLOADED | Kitchen load (per Part 10: "Production Status") | Internal |
| `chef_productivity_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Chef productivity (per Part 10: "Chef Productivity") | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI kitchen insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
