# SUOP Warehouse Execution App

**Industrial barcode-first warehouse operations app for Sudhamrit**

Built with React Native + Expo. Runs on Android phones, industrial handheld scanners (Zebra TC series, Honeywell, Chainway, Urovo), and tablets.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android emulator) OR physical Android device
- Expo Go app (for testing on physical device)

### Install & Run
```bash
cd mobile-app
npm install
npx expo start --dev-client
```

Then:
- Press `a` to run on Android emulator
- Press `s` to run on physical device (scan QR with Expo Go)
- Press `w` to run on web (for testing UI)

### Backend Connection
The app talks to your SUOP Bun backend. Update the API URL in `src/api/client.ts`:

```typescript
// For Android emulator (maps to localhost on host machine)
const API_BASE_URL = 'http://10.0.2.2:3030'

// For physical device on same WiFi as backend
const API_BASE_URL = 'http://192.168.1.100:3030'

// For production
const API_BASE_URL = 'https://your-backend.com'
```

## 📱 Features

### Authentication
- **PIN Login** — 4-digit numeric keypad (primary method)
- **Employee Login** — operator code + password
- **Biometric Login** — fingerprint/Face ID (expo-local-authentication)
- **Offline Login** — cached credentials work without network

### Operations
- **Receiving** — scan inbound shipment against ASN
- **Putaway** — move received goods to storage bins
- **Picking** — pick items for outbound orders
- **Transfer** — move inventory between bins
- **Cycle Count** — count inventory for audit
- **Dispatch** — verify & load outbound vehicles

### Barcode Scanning
- Camera-based scanning via `expo-camera`
- 10 symbologies: Code 128, Code 39, EAN-13, EAN-8, UPC, QR Code, GS1-128, GS1 DataMatrix, PDF417, Aztec
- **Industrial scanner support**: For Zebra/Honeywell devices, integrate DataWedge SDK (see `src/utils/scanner.ts` — future)
- Scan validation: WRONG_PRODUCT, WRONG_BATCH, WRONG_BIN, WRONG_QTY, DUPLICATE_SCAN, UNKNOWN_BARCODE
- Performance target: <300ms per scan

### Offline Sync Engine
- **Offline login** — cached operator credentials
- **Offline task execution** — pre-downloaded tasks work without network
- **Offline scanning** — validated locally against cached data
- **HMAC-signed transactions** — tamper-evident offline data
- **Automatic sync** — uploads on reconnect
- **Conflict resolution** — MERGE / KEEP_SERVER / MANUAL_REVIEW
- **Retry queue** — exponential backoff, max 5 attempts
- **Storage management** — 50MB offline storage limit

### Industrial UX
- Scanner-first, keyboard-last
- One screen = one task
- Maximum 3 taps to complete any operation
- Large touch targets for gloved operators
- Vibration feedback (expo-haptics)
- High contrast dark theme
- 6 languages: English, हिन्दी, मराठी, தமிழ், తెలుగు, ગુજરાતી

## 🔒 Security
- JWT authentication with refresh tokens
- Device binding (registered IMEI only)
- Encrypted offline storage (expo-secure-store for tokens)
- TLS communication
- Role-based access (OPERATOR role only sees mobile endpoints)
- Session timeout (8 hours)
- Remote device logout (via backend API)

## 📦 Build & Deploy

### Development Build (for testing with native scanner SDK)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android (development client)
eas build --platform android --profile development

# Install on device
eas build --platform android --profile preview
```

### Production Build (APK for MDM distribution)
```bash
# Build production APK
eas build --platform android --profile production

# The APK will be available for download
# Distribute via MDM (Zebra MDM, SOTI, etc.)
```

### OTA Updates (JavaScript-only updates, no APK rebuild)
```bash
# Push JS update to all devices
eas update --branch production
```

## 🏗️ Architecture

```
mobile-app/
├── App.tsx                    # Entry point + navigation
├── app.json                   # Expo config
├── package.json               # Dependencies
├── babel.config.js            # Babel config
├── tsconfig.json              # TypeScript config
└── src/
    ├── api/
    │   └── client.ts          # API client (Auth, Tasks, Scan, Sync, Inventory)
    ├── screens/
    │   ├── LoginScreen.tsx    # PIN/Employee/Biometric login
    │   ├── DashboardScreen.tsx # Operator home with stats + quick actions
    │   ├── TaskScreens.tsx    # Task queue + 4-step task execution
    │   └── OtherScreens.tsx   # Inventory lookup + Sync monitor + Settings
    ├── store/                 # State management (future: Zustand)
    ├── utils/
    │   └── offline.ts         # Offline sync engine
    └── types/
        └── index.ts           # TypeScript types
```

## 🔗 Backend Endpoints (Sprint 31)

The app consumes these endpoints from your Bun backend:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/mobile/login` | POST | Operator login |
| `/api/mobile/register` | POST | Register device |
| `/api/mobile/logout` | POST | Logout |
| `/api/mobile/profile` | GET | Operator profile |
| `/api/mobile/tasks` | GET | Get assigned tasks |
| `/api/mobile/tasks/:id/complete` | POST | Complete task |
| `/api/mobile/scan` | POST | Process barcode scan |
| `/api/mobile/sync` | POST | Sync offline transactions |
| `/api/mobile/sync/resolve` | POST | Resolve sync conflict |
| `/api/mobile/sync/status` | GET | Sync status |
| `/api/mobile/inventory-lookup` | GET | Search inventory |
| `/api/mobile/notifications` | GET | Get notifications |
| `/api/mobile/dashboard` | GET | Dashboard data |

## 🚀 Monorepo Setup (Future)

For shared code between this mobile app and the web ERP:

```
suop/
├── apps/
│   ├── web-erp/          # Next.js (current main app)
│   ├── mobile-app/       # This React Native app
│   └── exec-tower/       # Next.js (Executive Control Tower, role-gated)
├── packages/
│   ├── api-client/       # Shared TypeScript API client
│   ├── types/            # Shared types (Task, Product, Scan, etc.)
│   ├── barcode-utils/    # Shared GS1/barcode parsing
│   └── ui-components/    # Shared design system
├── mini-services/
│   └── suop-backend/     # Bun backend (serves all apps)
└── prisma/
    └── schema.prisma     # Single database schema
```

## 📋 Next Steps

1. **Zebra DataWedge Integration** — Add native module for Zebra scanner hardware trigger
2. **Push Notifications** — Integrate expo-notifications for task assignment alerts
3. **Voice Feedback** — Text-to-speech for scan results (expo-speech)
4. **3D Digital Twin** — AR warehouse navigation (future)
5. **Wearable Support** — Smartwatch notifications (future)
