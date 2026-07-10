# SUOP ERP — Local Deployment Guide
## Sprint 52 · Part 6 QMS · 473 Database Tables · 100+ Admin Modules

---

## 📦 What's in the ZIP

The ZIP file `suop-erp-sprint-52.zip` contains the complete SUOP ERP source code:
- **Next.js 16 Frontend** (React 19 + TypeScript + Tailwind CSS + Shadcn UI)
- **Bun Backend** (Mini-service on port 3030 with 150+ API endpoints)
- **Prisma Schema** (473 models — Parts 1-6: Platform, Master Data, Inventory, WMS, MES, QMS)
- **React Native Mobile App** (Warehouse + Production Execution apps)
- **Docker Compose** (PostgreSQL, Redis, RabbitMQ)
- **Worklog** (Complete sprint-by-sprint development history, Sprints 1-52)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 20+** (or Bun)
- **PostgreSQL 15+** (or use Docker Compose)
- **npm** or **bun**

### Step 1: Extract
```bash
unzip suop-erp-sprint-52.zip -d suop-erp
cd suop-erp
```

### Step 2: Install Dependencies
```bash
npm install
# OR if you have Bun:
# bun install
```

### Step 3: Set Up Environment
Create `.env` file (or edit the existing one):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/suop?schema=public"
# Optional (for auth - Demo Mode works without these):
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Start Database (Option A: Docker)
```bash
docker-compose up -d postgres redis
```

### Step 4: Start Database (Option B: Local PostgreSQL)
```bash
# Create database
createdb suop

# Run Prisma migration
npx prisma migrate dev --name init
# OR just generate the client:
npx prisma generate
```

### Step 5: Start the Frontend
```bash
npm run dev
```
Open: **http://localhost:3000**

### Step 6: Start the Backend (Optional)
```bash
# In a separate terminal:
cd mini-services/suop-backend
bun install
bun run index.ts
# OR:
npm install -g bun
bun mini-services/suop-backend/index.ts
```
Backend runs on: **http://localhost:3030**

### Step 7: Access the Application
1. Open http://localhost:3000
2. Click **"Explore Demo Mode (No Login Required)"**
3. You're in! Explore 100+ modules across Parts 1-6.

---

## 🏗️ Project Structure

```
suop-erp/
├── src/
│   └── app/
│       ├── page.tsx          # Main ERP (31,000+ lines, 100+ modules)
│       ├── mobile/
│       │   └── page.tsx      # Mobile app prototype (Warehouse + Production)
│       ├── api/              # Next.js API routes
│       └── globals.css       # Global styles
├── prisma/
│   └── schema.prisma         # 473 models (Parts 1-6)
├── mini-services/
│   └── suop-backend/
│       └── index.ts          # Bun backend (150+ endpoints, port 3030)
├── mobile-app/               # React Native Expo app
│   ├── App.tsx               # App selector (Warehouse vs Production)
│   └── src/
│       ├── screens/           # 10+ screens per app
│       ├── api/               # API client
│       └── utils/             # Offline sync
├── docker-compose.yml         # PostgreSQL + Redis + RabbitMQ
├── package.json
└── worklog.md                 # Sprint 1-52 development log
```

---

## 📊 What's Built (Sprint 1-52 Summary)

### Part 1-3: Platform Foundation (Sprints 1-21)
- Identity, RBAC, Organization, Master Data, PIM
- Inventory Engine (transactions, balances, reservations, cycle counts)
- Batch & Expiry, Costing & Valuation, Analytics

### Part 4: Warehouse Management (Sprints 22-33)
- Warehouse locations, receiving, putaway, picking, packing, dispatch
- Cross-dock, yard management, equipment management
- Mission control, digital twin, AI operations

### Part 5: Manufacturing Execution System (Sprints 34-48) ✅ COMPLETE
- Manufacturing foundation, recipe/BOM, MRP, production orders
- Shop floor execution, batch traceability, production mobile app
- Packaging & finished goods, production costing, machine/IoT integration
- OEE & analytics, waste/yield management, finite capacity scheduling
- Mission control, AI manufacturing intelligence

### Part 6: Quality Management System (Sprints 49-52, In Progress)
- Quality foundation (standards, inspection master, sampling, specifications)
- Supplier quality & incoming inspection (IQC, NCR, vendor scorecards)
- In-process quality control (IPQC, CCP monitoring, batch quality records)
- Finished goods quality control (FGQC, batch release, quality certificates)

---

## 🔧 Build Commands

```bash
# Production build
npm run build

# Start production server
npm start

# Development server (hot reload)
npm run dev

# Backend only
cd mini-services/suop-backend && bun run index.ts

# Prisma studio (view database)
npx prisma studio

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev

# Mobile app (Expo)
cd mobile-app && npx expo start
```

---

## 🐳 Docker Deployment

```bash
# Start all services (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Build and start the app
docker-compose up -d app

# Access at http://localhost:3000
```

---

## 📱 Mobile App

The mobile app has two modes:
1. **Warehouse Execution App** — Receivers, Pickers, Forklifts, Dispatch
2. **Production Execution App** — Mixing, Cooking, Packing Operators

### Run the mobile app:
```bash
cd mobile-app
npm install
npx expo start
# Scan QR code with Expo Go app on your phone
```

---

## 🔐 Authentication

- **Demo Mode**: Click "Explore Demo Mode" on login page — no credentials needed
- **Supabase Auth**: Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` for real authentication
- The app works fully in Demo Mode without any backend or database

---

## 📈 Key Metrics

| Metric | Value |
|--------|-------|
| Total Sprints Completed | 52 |
| Database Models | 473 |
| Frontend Modules | 100+ |
| Backend Endpoints | 150+ |
| Main page.tsx Lines | 31,000+ |
| Backend Lines | 13,500+ |
| Prisma Schema Lines | 16,000+ |
| Mobile App Screens | 20+ |

---

## ❓ Troubleshooting

**Q: Build fails with "Cannot find module"**
A: Run `npm install` first

**Q: Prisma errors**
A: Run `npx prisma generate` after extracting

**Q: Port 3000 already in use**
A: Run `npm run dev -- -p 3001` to use port 3001

**Q: Backend not connecting**
A: The frontend works in Demo Mode without the backend. Backend is optional for viewing the UI.

**Q: Database connection failed**
A: The app works without a database in Demo Mode. For real data, set up PostgreSQL and update `DATABASE_URL` in `.env`.

---

## 🎯 Next Steps After Local Deployment

1. **Explore Demo Mode** — Login → Click "Explore Demo Mode"
2. **Check the sidebar** — Organized by Parts 1-6 with 100+ modules
3. **Try key modules**:
   - Dashboard (Sprint overview)
   - Batch Master → Genealogy Viewer → Traceability Search (Sprint 39)
   - Machine Dashboard → IoT Gateway → Sensor Dashboard (Sprint 43)
   - OEE Dashboard → Downtime Center (Sprint 44)
   - AI Smart Factory → AI Recommendations (Sprint 48)
   - Quality Dashboard → Standards → Inspection Master (Sprint 49)
   - Supplier Quality → Inspection Queue → Quality Hold (Sprint 50)
   - IPQC Dashboard → CCP Monitor → Batch Quality (Sprint 51)
   - FGQC Dashboard → Batch Release → Certificates (Sprint 52)
4. **Launch Mobile App** — Click "Launch Mobile App" button in header, or visit `/mobile`
5. **Check the worklog** — `worklog.md` has complete sprint-by-sprint history

---

## 📞 Support

For questions about the codebase, check:
- `worklog.md` — Complete development history
- `prisma/schema.prisma` — All 473 database models with comments
- `mini-services/suop-backend/index.ts` — All 150+ API endpoints
- Sidebar sections in `src/app/page.tsx` — All 100+ admin modules

---

**SUOP — Sudhastar Unified Operating Platform**
Sprints 1-52 · Part 6 QMS · 473 Database Tables
Built for Sudhamrit Foods
