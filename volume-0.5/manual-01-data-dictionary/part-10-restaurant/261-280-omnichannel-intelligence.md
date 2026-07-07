# Manual 1 · Part 10 · Sections 4 & 5 · Entities 261-280 — Delivery, Omnichannel & Restaurant Intelligence

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 10 — Enterprise Restaurant Operations |
| Sections | 4 (Delivery & Omnichannel), 5 (Intelligence & AI) |
| Entities | 261–280 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 14 §14.11, Ch 15 §15.6, Ch 24 §24.7, Part 10 §4-5 |
| Last Updated | 2026-07-07 |

---

## Overview — Omnichannel & Intelligence

Sections 4 & 5 complete the Restaurant domain by adding **omnichannel ordering, delivery management, customer experience**, and **restaurant intelligence with AI**.

```
OMNICHANNEL (Sec 4: 261-270)
  Online Order (261) → Delivery (262) → Partner (263) → Rider (264) → Tracking (265)
  QR Ordering (266) → Feedback (267) → Loyalty (268) → Table Payment (269) → Dashboard (270)
  ↓ Analyzed by
INTELLIGENCE (Sec 5: 271-280)
  KPI Library (271) → Dashboard (272) → Mission Control (273) → Forecast (274)
  Benchmark (275) → AI Menu Engineering (276) → Kitchen AI Copilot (277)
  Customer Intelligence (278) → Digital Twin (279) → Executive Scorecard (280)
```

---

## Entity 261 — Online Order

### 1. Business Purpose
Per Part 10: Sources — Website, Mobile App, QR, Swiggy, Zomato, ONDC, WhatsApp, Phone Order.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `order_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `order_source` | ENUM | Yes | — | WEBSITE, MOBILE_APP, QR, SWIGGY, ZOMATO, ONDC, WHATSAPP, PHONE_ORDER (per Part 10) | Source | Internal |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `customer_name` | VARCHAR(200) | Yes | — | Min 2 | Name | Internal |
| `customer_phone` | VARCHAR(20) | Yes | — | E.164 | Phone | Confidential |
| `order_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Order time | Internal |
| `total_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Order total | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PAID, COD, REFUNDED | Payment | Internal |
| `delivery_type` | ENUM | Yes | — | HOME_DELIVERY, PICKUP, DINE_IN | Type | Internal |
| `delivery_order_id` | UUID | No | NULL | FK to `delivery_orders` (Entity 262) | Delivery details | Internal |
| `external_reference` | VARCHAR(100) | No | NULL | — | Swiggy/Zomato order ID | Internal |
| `commission_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Platform commission | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, CONFIRMED, PREPARING, READY, DISPATCHED, DELIVERED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 262 — Delivery Order

### 1. Business Purpose
Per Part 10: Home Delivery, Express Delivery, Scheduled Delivery, Pickup, Curbside Pickup.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `delivery_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `online_order_id` | UUID | Yes | — | FK to `online_orders` | Parent order | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Source restaurant | Internal |
| `delivery_type` | ENUM | Yes | — | HOME_DELIVERY, EXPRESS_DELIVERY, SCHEDULED_DELIVERY, PICKUP, CURBSIDE_PICKUP (per Part 10) | Type | Internal |
| `delivery_address` | JSONB | Yes | `'{}'` | — | Delivery address | Confidential |
| `delivery_slot_start` | TIMESTAMPTZ | Yes | — | — | Slot start | Internal |
| `delivery_slot_end` | TIMESTAMPTZ | Yes | — | > slot_start | Slot end | Internal |
| `delivery_distance_km` | DECIMAL(8,2) | No | NULL | ≥ 0 | Distance | Internal |
| `delivery_charge` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Charge | Confidential |
| `partner_id` | UUID | No | NULL | FK to `delivery_partners` (Entity 263) | Delivery partner | Internal |
| `rider_assignment_id` | UUID | No | NULL | FK to `rider_assignments` (Entity 264) | Rider | Internal |
| `tracking_id` | UUID | No | NULL | FK to `delivery_tracking` (Entity 265) | Tracking | Internal |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | Dispatch time | Internal |
| `delivered_at` | TIMESTAMPTZ | No | NULL | — | Delivery time | Internal |
| `delivery_otp` | VARCHAR(6) | Yes | — | — | Customer OTP | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, SCHEDULED, PREPARING, READY, DISPATCHED, IN_TRANSIT, DELIVERED, FAILED, RETURNED | Status | Internal |

---

## Entity 263 — Delivery Partner

### 1. Business Purpose
Per Part 10: Internal Rider, Swiggy Genie, Porter, Dunzo, Shiprocket, Third Party.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `partner_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `partner_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `partner_type` | ENUM | Yes | — | INTERNAL_RIDER, SWIGGY_GENIE, PORTER, DUNZO, SHIPROCKET, THIRD_PARTY (per Part 10) | Type | Internal |
| `is_internal` | BOOLEAN | Yes | `false` | — | Internal vs external | Internal |
| `api_endpoint` | VARCHAR(500) | No | NULL | — | API integration URL | Internal |
| `api_key` | VARCHAR(200) | No | NULL | — | API key (encrypted) | Confidential |
| `commission_rate_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Commission rate | Confidential |
| `service_areas` | JSONB | No | `'[]'` | — | Service areas: `[{ city, pincode_range }]` | Internal |
| `avg_delivery_time_min` | INTEGER | No | NULL | ≥ 0 | Avg time | Internal |
| `rating` | DECIMAL(3,2) | No | NULL | 0-5 | Partner rating | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 264 — Rider Assignment

### 1. Business Purpose
Per Part 10: AI considers Distance, Order Priority, Vehicle, Traffic, SLA.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `assignment_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `delivery_order_id` | UUID | Yes | — | FK to `delivery_orders` | Order to assign | Internal | |
| `rider_user_id` | UUID | No | NULL | FK to `user_accounts` | Assigned rider | Internal | |
| `partner_id` | UUID | Yes | — | FK to `delivery_partners` | Delivery partner | Internal | |
| `vehicle_number` | VARCHAR(20) | No | NULL | — | Vehicle | Internal | |
| `vehicle_type` | ENUM | No | NULL | BIKE, SCOOTER, CYCLE, CAR, AUTO | Vehicle type | Internal | |
| `assignment_method` | ENUM | Yes | `MANUAL` | MANUAL, AUTO_ASSIGN, AI_OPTIMIZED | Method | Internal | Rider AI |
| `ai_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI assignment score (per Part 10 AI) | Internal | Rider AI |
| `ai_factors` | JSONB | No | NULL | — | AI factors: `{ distance, priority, traffic, sla }` (per Part 10) | Internal | |
| `assigned_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Assignment time | Internal | |
| `accepted_at` | TIMESTAMPTZ | No | NULL | — | Rider accepted | Internal | |
| `status` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED, CANCELLED | Status | Internal | |

---

## Entity 265 — Delivery Tracking

### 1. Business Purpose
Per Part 10: Rider Location, ETA, Route, Customer OTP, Delivery Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `delivery_order_id` | UUID | Yes | — | FK to `delivery_orders` | Parent order | Internal |
| `rider_user_id` | UUID | Yes | — | FK to `user_accounts` | Rider (per Part 10: "Rider Location") | Internal |
| `current_latitude` | DECIMAL(10,7) | No | NULL | — | Current lat | Internal |
| `current_longitude` | DECIMAL(10,7) | No | NULL | — | Current long (per Part 10: "Rider Location") | Internal |
| `estimated_eta_min` | INTEGER | No | NULL | ≥ 0 | ETA (per Part 10: "ETA") | Internal |
| `route_data` | JSONB | No | NULL | — | Route: `[{ lat, long, timestamp }]` (per Part 10: "Route") | Internal |
| `total_distance_km` | DECIMAL(8,2) | No | NULL | ≥ 0 | Total distance | Internal |
| `customer_otp` | VARCHAR(6) | Yes | — | — | Delivery OTP (per Part 10: "Customer OTP") | Confidential |
| `otp_verified` | BOOLEAN | Yes | `false` | — | OTP confirmed | Internal |
| `delivery_status` | ENUM | Yes | `DISPATCHED` | DISPATCHED, IN_TRANSIT, NEARBY, DELIVERED, FAILED (per Part 10: "Delivery Status") | Status | Internal |
| `tracking_url` | VARCHAR(500) | No | NULL | — | Customer tracking URL | Public |
| `last_updated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Last location update | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

---

## Entity 266 — QR Ordering

### 1. Business Purpose
Per Part 10 flow: Customer → Scan QR → Menu → Order → Kitchen → Payment → Feedback.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `qr_session_code` | VARCHAR(50) | Yes | — | Unique | Session code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `table_id` | UUID | Yes | — | FK to `table_masters` | Dining table (per Part 10: "Scan QR") | Internal |
| `qr_code_value` | VARCHAR(100) | Yes | — | — | Scanned QR value | Public |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Customer (if identified) | Confidential |
| `session_started_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Session start | Internal |
| `session_ended_at` | TIMESTAMPTZ | No | NULL | — | Session end | Internal |
| `order_id` | UUID | No | NULL | FK to `restaurant_orders` | Placed order (per Part 10: "Order") | Internal |
| `payment_completed` | BOOLEAN | Yes | `false` | — | Payment done (per Part 10: "Payment") | Internal |
| `feedback_submitted` | BOOLEAN | Yes | `false` | — | Feedback done (per Part 10: "Feedback") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ORDERED, PAID, COMPLETED, EXPIRED | Status | Internal |

---

## Entity 267 — Customer Feedback

### 1. Business Purpose
Per Part 10: Rating for Food, Taste, Delivery, Packaging, Service, Cleanliness. AI: Sentiment Analysis.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `feedback_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `order_id` | UUID | Yes | — | FK to `restaurant_orders` | Linked order | Internal | |
| `customer_id` | UUID | No | NULL | FK to `retail_customers` | Customer | Confidential | |
| `food_rating` | DECIMAL(3,2) | Yes | — | 0-5 | Food (per Part 10: "Food") | Internal | |
| `taste_rating` | DECIMAL(3,2) | Yes | — | 0-5 | Taste (per Part 10: "Taste") | Internal | |
| `delivery_rating` | DECIMAL(3,2) | No | NULL | 0-5 | Delivery (per Part 10: "Delivery") | Internal | |
| `packaging_rating` | DECIMAL(3,2) | No | NULL | 0-5 | Packaging (per Part 10: "Packaging") | Internal | |
| `service_rating` | DECIMAL(3,2) | Yes | — | 0-5 | Service (per Part 10: "Service") | Internal | |
| `cleanliness_rating` | DECIMAL(3,2) | Yes | — | 0-5 | Cleanliness (per Part 10: "Cleanliness") | Internal | |
| `overall_rating` | DECIMAL(3,2) | Yes | — | 0-5 | Average | Internal | |
| `feedback_text` | TEXT | No | NULL | — | Written feedback | Internal | Sentiment AI |
| `ai_sentiment` | ENUM | No | NULL | POSITIVE, NEUTRAL, NEGATIVE, MIXED | AI sentiment (per Part 10 AI) | Internal | Sentiment AI |
| `ai_sentiment_score` | DECIMAL(5,2) | No | NULL | 0-100 | Sentiment confidence | Internal | |
| `would_recommend` | BOOLEAN | No | NULL | — | NPS | Internal | |
| `submitted_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Submission time | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal | |

---

## Entity 268 — Restaurant Loyalty

### 1. Business Purpose
Per Part 10: Points, Coupons, Rewards, Membership, Wallet, Subscriptions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers` | Customer | Confidential |
| `restaurant_id` | UUID | No | NULL | FK to `restaurants` | Restaurant (NULL = all) | Internal |
| `loyalty_points` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Points balance (per Part 10: "Points") | Internal |
| `membership_tier` | ENUM | Yes | `SILVER` | SILVER, GOLD, PLATINUM, DIAMOND | Tier (per Part 10: "Membership") | Public |
| `wallet_balance` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Wallet (per Part 10: "Wallet") | Confidential |
| `total_points_earned` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Lifetime earned | Internal |
| `total_points_redeemed` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Lifetime redeemed | Internal |
| `active_coupons` | UUID[] | No | `ARRAY[]::UUID[]` | FK array | Active coupons (per Part 10: "Coupons") | Internal |
| `subscription_type` | ENUM | No | NULL | NONE, MONTHLY, QUARTERLY, ANNUAL | Subscription (per Part 10: "Subscriptions") | Internal |
| `subscription_expiry` | DATE | No | NULL | — | Expiry | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, SUSPENDED | Status | Internal |

---

## Entity 269 — Table QR Payment

### 1. Business Purpose
Per Part 10: UPI, Card, Wallet, Split Bill, Corporate Billing.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payment_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `order_id` | UUID | Yes | — | FK to `restaurant_orders` | Order to pay | Internal |
| `table_id` | UUID | Yes | — | FK to `table_masters` | Table | Internal |
| `payment_method` | ENUM | Yes | — | UPI, CARD, WALLET, SPLIT_BILL, CORPORATE_BILLING (per Part 10) | Method | Confidential |
| `total_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total to pay | Confidential |
| `paid_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Amount paid | Confidential |
| `split_details` | JSONB | No | NULL | — | Split: `[{ customer_id, amount, method }]` (per Part 10: "Split Bill") | Confidential |
| `upi_id` | VARCHAR(100) | No | NULL | — | UPI ID | Internal |
| `corporate_gst_number` | VARCHAR(15) | No | NULL | GSTIN | Corporate GST (per Part 10: "Corporate Billing") | Confidential |
| `invoice_number` | VARCHAR(50) | No | NULL | — | Generated invoice | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PARTIAL, PAID, FAILED | Status | Internal |
| `paid_at` | TIMESTAMPTZ | No | NULL | — | Payment time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

---

## Entity 270 — Omnichannel Dashboard

### 1. Business Purpose
Per Part 10: Online Orders, Delivery Orders, Average Delivery Time, Customer Ratings, Cancelled Orders, Live Riders.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `online_orders_today` | INTEGER | Yes | `0` | ≥ 0 | Online orders (per Part 10: "Online Orders") | Internal |
| `delivery_orders_today` | INTEGER | Yes | `0` | ≥ 0 | Delivery orders (per Part 10: "Delivery Orders") | Internal |
| `avg_delivery_time_min` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Avg delivery (per Part 10: "Average Delivery Time") | Internal |
| `customer_rating_avg` | DECIMAL(3,2) | Yes | `0` | 0-5 | Avg rating (per Part 10: "Customer Ratings") | Internal |
| `cancelled_orders` | INTEGER | Yes | `0` | ≥ 0 | Cancelled (per Part 10: "Cancelled Orders") | Internal |
| `live_riders_count` | INTEGER | Yes | `0` | ≥ 0 | Active riders (per Part 10: "Live Riders") | Internal |
| `cancellation_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Cancellation rate | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI omnichannel insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 271 — Restaurant KPI Library

### 1. Business Purpose
Per Part 10: Revenue, Orders, AOV, Table Turnover, Food Cost, Food Cost %, Kitchen Time, Serving Time, Customer Satisfaction, Delivery Time, Chef Productivity, Waste %, Inventory Days, Gross Margin, Net Margin.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `RST_FOOD_COST_PCT`) | Internal |
| `kpi_name` | VARCHAR(100) | Yes | — | — | Display name (per Part 10) | Public |
| `kpi_category` | ENUM | Yes | — | REVENUE, OPERATIONAL, COST, CUSTOMER, INVENTORY, STAFF, DELIVERY | Category | Internal |
| `formula` | TEXT | Yes | — | — | Calculation formula | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target | Internal |
| `current_value` | DECIMAL(18,4) | No | NULL | — | Latest | Internal |
| `restaurant_id` | UUID | No | NULL | FK to `restaurants` | Scope (NULL = company) | Internal |
| `snapshot_date` | DATE | Yes | — | — | Measurement date | Internal |
| `is_critical_kpi` | BOOLEAN | Yes | `false` | — | Feeds Mission Control | Confidential |

---

## Entity 272 — Restaurant Dashboard

### 1. Business Purpose
Per Part 10: Today's Sales, Live Tables, Kitchen Queue, Orders, Delivery, Reservations, Customer Rating, Top Selling Items, Waste.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `restaurant_id` | UUID | No | NULL | FK to `restaurants` | Scope | Internal |
| `widget_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 10) | Internal |
| `refresh_interval_sec` | INTEGER | Yes | `30` | > 0 | Refresh rate | Internal |
| `target_audience` | ENUM | Yes | `MANAGER` | CHEF, MANAGER, AREA_MANAGER, EXECUTIVE | Audience | Internal |
| `is_mission_control_enabled` | BOOLEAN | Yes | `false` | — | Shows on Mission Control | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 273 — Restaurant Mission Control

### 1. Business Purpose
Per Part 10: Kitchen, Dining, Delivery, Inventory, Reservations, Revenue, Staff, Alerts, AI.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `control_room_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `scope` | ENUM | Yes | `COMPANY` | RESTAURANT, REGION, COMPANY | Scope | Internal |
| `view_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 10) | Internal |
| `display_duration_sec` | INTEGER | Yes | `30` | > 0 | Rotation interval | Internal |
| `is_live` | BOOLEAN | Yes | `true` | — | Real-time data | Internal |
| `websocket_endpoint` | VARCHAR(200) | No | NULL | — | Live data endpoint | Internal |
| `ai_recommendations` | JSONB | No | NULL | — | Live AI recommendations (per Part 10: "AI") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 274 — Restaurant Forecast

### 1. Business Purpose
Per Part 10: Sales, Ingredients, Customers, Staff, Utilities, Festival Demand.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `forecast_type` | ENUM | Yes | — | SALES, INGREDIENTS, CUSTOMERS, STAFF, UTILITIES, FESTIVAL_DEMAND (per Part 10) | Type | Confidential | Demand AI |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal | |
| `forecast_date` | DATE | Yes | — | — | Forecast date | Internal | |
| `forecast_horizon` | ENUM | Yes | `WEEKLY` | DAILY, WEEKLY, MONTHLY | Horizon | Internal | |
| `predicted_value` | DECIMAL(18,4) | Yes | — | — | Predicted | Confidential | |
| `confidence_lower` | DECIMAL(18,4) | No | NULL | — | Lower bound | Internal | |
| `confidence_upper` | DECIMAL(18,4) | No | NULL | — | Upper bound | Internal | |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model | Internal | |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Model accuracy | Internal | |
| `actual_value` | DECIMAL(18,4) | No | NULL | — | Actual (for training) | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, VERIFIED, EXPIRED | Status | Internal | |

---

## Entity 275 — Restaurant Benchmark

### 1. Business Purpose
Per Part 10: Restaurant vs Restaurant, Manager vs Manager, Chef vs Chef, Menu vs Menu.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `benchmark_name` | VARCHAR(200) | Yes | — | — | Name | Internal |
| `benchmark_type` | ENUM | Yes | — | RESTAURANT_VS_RESTAURANT, MANAGER_VS_MANAGER, CHEF_VS_CHEF, MENU_VS_MENU (per Part 10) | Type | Internal |
| `metric_code` | VARCHAR(30) | Yes | — | FK to `restaurant_kpi_library` | Compared metric | Internal |
| `period_start` | DATE | Yes | — | — | Period start | Internal |
| `period_end` | DATE | Yes | — | > period_start | Period end | Internal |
| `entity_ids` | UUID[] | Yes | — | — | Entities compared | Internal |
| `results` | JSONB | Yes | `'{}'` | — | Results: `[{ entity_id, value, rank }]` | Internal |
| `best_entity_id` | UUID | No | NULL | — | Top performer | Internal |
| `worst_entity_id` | UUID | No | NULL | — | Bottom performer | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 276 — AI Menu Engineering

### 1. Business Purpose
Per Part 10: High Profit Items, Low Profit Items, Menu Removal, Menu Addition, Price Change, Cross Sell, Bundle.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `menu_id` | UUID | No | NULL | FK to `menu_masters` | Affected menu item | Internal |
| `recommendation_type` | ENUM | Yes | — | HIGH_PROFIT_PROMOTE, LOW_PROFIT_REVIEW, MENU_REMOVAL, MENU_ADDITION, PRICE_CHANGE, CROSS_SELL, BUNDLE (per Part 10) | Type | Internal |
| `description` | TEXT | Yes | — | Min 20 chars | Recommendation | Internal |
| `expected_impact` | JSONB | No | NULL | — | `{ "revenue_lift_pct": X, "margin_improvement_pct": Y }` | Confidential |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | AI confidence | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Source model | Internal |
| `action_taken` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED, IMPLEMENTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 277 — Kitchen AI Copilot

### 1. Business Purpose
Per Part 10: Cooking Sequence, Batch Production, Chef Assignment, Station Load, Kitchen Efficiency, Preparation Prediction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Restaurant | Internal |
| `recommendation_type` | ENUM | Yes | — | COOKING_SEQUENCE, BATCH_PRODUCTION, CHEF_ASSIGNMENT, STATION_LOAD, KITCHEN_EFFICIENCY, PREPARATION_PREDICTION (per Part 10) | Type | Internal |
| `description` | TEXT | Yes | — | Min 20 chars | Recommendation | Internal |
| `target_entity_type` | VARCHAR(30) | No | NULL | — | KOT, CHEF, STATION | Internal |
| `target_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `expected_impact` | JSONB | No | NULL | — | `{ "time_saved_min": X, "efficiency_gain_pct": Y }` | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | AI confidence | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Source model | Internal |
| `action_taken` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED, IMPLEMENTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 278 — Customer Intelligence

### 1. Business Purpose
Per Part 10: Visit Frequency, Favorite Food, Lifetime Value, Order Pattern, Birthday, Anniversary, Feedback, Complaints.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `customer_id` | UUID | Yes | — | FK to `retail_customers`, UNIQUE | Customer | Confidential | |
| `visit_frequency_per_month` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Visits/month (per Part 10: "Visit Frequency") | Internal | Segmentation AI |
| `favorite_food_items` | JSONB | No | `'[]'` | — | Top items (per Part 10: "Favorite Food") | Internal | |
| `lifetime_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | LTV (per Part 10: "Lifetime Value") | Confidential | |
| `order_pattern` | ENUM | No | NULL | DAILY, WEEKLY, OCCASIONAL, FESTIVAL | Pattern (per Part 10: "Order Pattern") | Internal | Segmentation AI |
| `birthday` | DATE | No | NULL | — | Birthday (per Part 10) | Internal | |
| `anniversary` | DATE | No | NULL | — | Anniversary (per Part 10) | Internal | |
| `avg_feedback_rating` | DECIMAL(3,2) | Yes | `0` | 0-5 | Avg rating (per Part 10: "Feedback") | Internal | |
| `complaint_count` | INTEGER | Yes | `0` | ≥ 0 | Complaints (per Part 10: "Complaints") | Confidential | |
| `ai_segment` | VARCHAR(50) | No | NULL | — | AI segment | Confidential | Segmentation AI |
| `churn_risk_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Churn risk | Confidential | Churn AI |
| `last_analyzed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Last analysis | Internal | |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal | |

---

## Entity 279 — Restaurant Digital Twin

### 1. Business Purpose
Per Part 10: Digital Restaurant — Tables, Kitchen, Customers, Orders, Inventory, Staff, Delivery. AI enabled.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `twin_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `restaurant_id` | UUID | Yes | — | FK to `restaurants` | Physical restaurant | Internal |
| `twin_model_file_id` | UUID | Yes | — | FK to `file_attachments` | 3D/2D model | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `real_time_data_feed` | BOOLEAN | Yes | `true` | — | Live data | Internal |
| `iot_endpoint` | VARCHAR(200) | No | NULL | — | MQTT/WebSocket | Internal |
| `simulation_capabilities` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Enabled simulations | Internal |
| `last_synced_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 280 — Restaurant Executive Scorecard

### 1. Business Purpose
Per Part 10: Sales, Profit, Food Cost, Waste, Customer Rating, Delivery SLA, Kitchen Efficiency, Labor Cost, Inventory, Overall Health.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scorecard_date` | DATE | Yes | — | — | Date | Internal |
| `restaurant_id` | UUID | No | NULL | FK to `restaurants` | Scope (NULL = company) | Internal |
| `scorecard_type` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL | Period | Internal |
| `sales_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Sales (per Part 10: "Sales") | Confidential |
| `profit_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Profit (per Part 10: "Profit") | Confidential |
| `food_cost_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Food cost (per Part 10: "Food Cost") | Confidential |
| `waste_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Waste (per Part 10: "Waste") | Internal |
| `customer_rating_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rating (per Part 10: "Customer Rating") | Internal |
| `delivery_sla_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Delivery (per Part 10: "Delivery SLA") | Internal |
| `kitchen_efficiency_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Kitchen (per Part 10: "Kitchen Efficiency") | Internal |
| `labor_cost_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Labor (per Part 10: "Labor Cost") | Confidential |
| `inventory_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Inventory (per Part 10: "Inventory") | Internal |
| `overall_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall (per Part 10: "Overall Health") | Confidential |
| `overall_grade` | ENUM | Yes | — | A, B, C, D, F | Letter grade | Internal |
| `previous_score` | DECIMAL(5,2) | No | NULL | — | Previous period | Internal |
| `trend_direction` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 10 Completion Summary

**Part 10 (Enterprise Restaurant Operations) is now COMPLETE** with 50 entities (231–280) across 5 sections.

### Key Achievements

1. **Multi-outlet architecture** — Multiple restaurant types (QSR, Casual, Fine Dining, Cloud Kitchen, etc.)
2. **QR-enabled dining** — Table QR ordering with full session tracking
3. **Digital table management** — Real-time status, reservations, seating, wait time AI
4. **Recipe-driven kitchen** — Every menu item linked to recipe version (immutable trace)
5. **Digital KOT** — Kitchen Order Tickets with priority routing and KDS integration
6. **Multi-kitchen routing** — Automatic station routing (Pizza → Pizza Station, etc.)
7. **Recipe consumption engine** — Auto-deducts ingredients on KOT PREPARING
8. **Unified inventory** — Kitchen inventory is scoped view of Enterprise Inventory Ledger (not separate)
9. **Kitchen production batches** — Bulk prep items (tea, sambar, gravy) with batch tracking
10. **Food costing** — 7 cost components (ingredients, packaging, gas, electricity, labor, utility, overhead)
11. **Kitchen wastage** — 7 waste types with tolerance approval
12. **Ingredient replenishment** — Auto-triggered from warehouse when minimum level hit
13. **Omnichannel** — 8 order sources (Table, QR, Waiter, Takeaway, Delivery, Web, App, Marketplace)
14. **Delivery management** — 6 delivery partners, AI rider assignment, real-time tracking
15. **Customer feedback** — 6 rating dimensions + AI sentiment analysis
16. **Restaurant loyalty** — Points, tiers, wallet, coupons, subscriptions
17. **Table QR payment** — UPI, Card, Wallet, Split Bill, Corporate Billing
18. **AI Kitchen Copilot** — Cooking sequence, batch production, chef assignment, station load
19. **AI Menu Engineering** — Profit-based menu optimization recommendations
20. **Restaurant Digital Twin** — Tables, kitchen, customers, orders, inventory, staff modeled digitally
21. **Restaurant Mission Control** — Executive command center for all restaurants
22. **Enterprise Kitchen 4.0** — IoT kitchen, smart scales, voice chef, temperature monitoring (future-ready)
23. **Complete audit trail** — Every order, KOT, consumption, waste, payment audited
24. **End-to-end traceability** — Customer → Order → KOT → Recipe → Ingredient → Batch → Supplier
