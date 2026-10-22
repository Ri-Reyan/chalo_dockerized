# 🚗 Chalo Client Frontend & Mobility Interface

> Modern, ultra-responsive Next.js (App Router) and Tailwind CSS web application for the **Chalo** ride-hailing platform. Offers a seamless dual-role experience for Customers and Drivers with real-time Leaflet mapping, live trip telemetry, unified session management, and Stripe Checkout integration.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Problem & Solution](#-problem--solution)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features by Role](#-key-features-by-role)
- [Route Hierarchy & Protected Navigation](#-route-hierarchy--protected-navigation)
- [Live Interactive Map System](#-live-interactive-map-system)
- [Real-Time Socket State Synchronization](#-real-time-socket-state-synchronization)
- [Setup & Installation Guide](#-setup--installation-guide)
- [Environment Variables (.env.example)](#-environment-variables-envexample)
- [Production Build & Quality Verification](#-production-build--quality-verification)

---

## 🌟 Overview

The Chalo Client application is designed around intuitive mobility interactions, warm editorial aesthetics (Warm Ivory `#FDFCF8`, Charcoal `#292524`, Coral `#FFB7B2`, Sage Green `#E8EFE8`), and bulletproof real-time reactivity:
- **Unified Portal Authentication**: Consolidated login and registration with automated role-based dashboard forwarding.
- **Interactive Route Planning**: Dual-point location picking using interactive Leaflet maps with dynamic polyline route generation and upfront distance/fare calculations.
- **Stripe Upfront Escrow Flow**: Seamless checkout transition with automatic session verification and state recovery on page refreshes.
- **Manual Driver Control Cockpit**: Manual step-by-step dispatch progression buttons ("Arrived at Pickup", "Start Trip", coordinate step simulation) bypassing browser GPS permission errors.
- **Instant Live Tracking**: Bi-directional driver and passenger synchronization powered by Socket.IO without polling delays.

---

## 🎯 Problem & Solution

### The Problem
- **Dual Login Complexity**: Separate login routes for passengers and drivers confuse users and duplicate authentication context logic.
- **Unreliable Geolocation**: Mobile browsers frequently block background `navigator.geolocation` or throttle GPS intervals, leading to frozen driver pins and navigation failures.
- **Hydration Mismatches**: Accessing browser `localStorage` during initial Server-Side Rendering (SSR) causes hydration errors and UI flicker.
- **State Loss on Refresh**: Losing active ride state during external Stripe checkout returns leaves customers stranded with charged cards.

### The Chalo Solution
- **Unified Authentication Architecture**: A single `/login` page with dynamic role-based routing (`CUSTOMER` -> `/customer`, `DRIVER` -> `/driver`) and resilient session verification.
- **Driver Manual Control System**: Replaced fragile browser geolocation tracking with an interactive button-based progression panel for arriving, starting, and broadcasting coordinates.
- **SSR-Safe Hydration**: Structured initial mount synchronization ensuring 100% identical server and client DOM trees before hydrating persistent user state.
- **Idempotent Session Storage & Server Fallback**: Active ride snapshots stored in `sessionStorage` alongside backend `GET /api/rides/active` reconciliation ensures seamless state restoration upon return from Stripe.

---

## 🏗️ Architecture & Tech Stack

```
                              ┌─────────────────────────┐
                              │     Next.js 16 App      │
                              │       RootLayout        │
                              └────────────┬────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
            ┌───────────────────┐                     ┌───────────────────┐
            │   AuthProvider    │                     │  ToasterProvider  │
            │  (Global Session) │                     │  (Sonner Toasts)  │
            └─────────┬─────────┘                     └───────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Public Routes   │      │ Protected Routes │
│  • / (Landing)   │      │ (ProtectedRoute) │
│  • /login        │      └────────┬─────────┘
│  • /register     │               │
└──────────────────┘      ┌────────┴────────┐
                          ▼                 ▼
                 ┌─────────────────┐ ┌─────────────────┐
                 │    /customer    │ │     /driver     │
                 │  - RequestRide  │ │  - AvailableReq │
                 │  - LiveTracking │ │  - OngoingRide  │
                 │  - RideHistory  │ │  - DriverWallet │
                 │  - Profile      │ │  - Profile      │
                 └─────────────────┘ └─────────────────┘
```

| Technology | Purpose |
|---|---|
| **Next.js (v16.4 App Router)** | Production React framework with server components and streaming |
| **React (v19) & TypeScript** | Declarative, strictly typed component architecture |
| **Tailwind CSS (v4)** | Modern utility styling with custom warmth palette and responsive layouts |
| **Leaflet & React-Leaflet** | Client-only interactive mapping, vector polylines, and dynamic marker pins |
| **Socket.IO Client (v4.8)** | Real-time WebSocket connection to the Chalo dispatch engine |
| **Axios** | HTTP client configured with credentials and bearer token interceptors |
| **Sonner** | Clean, accessible toast notification system |

---

## 🚘 Key Features by Role

### Customer Experience (`/customer`)
- **Route Estimator**: Instant distance (km) and upfront fare calculation for Motorbike ($1.50 base + $0.80/km) and Car ($3.00 base + $1.50/km).
- **Interactive Map Picker**: Drag-and-drop or click-to-pin location selection modal.
- **Stripe Checkout Integration**: Seamless redirect to Stripe Checkout and automatic redirection to live tracking upon confirmation.
- **Live Trip Telemetry**: Live map showing driver progress, 3-minute ETA countdown, SOS trigger, and cancellation dialog.
- **Arrival Confirmation & Rating**: Passenger verifies arrival, releasing funds to driver wallet and rating the experience.
- **Ride History & Receipts**: Complete breakdown of past trips with rebook shortcuts.

### Driver Partner Cockpit (`/driver`)
- **Online / Offline Toggle**: Instant dispatch pool subscription with real-time room joining.
- **Incoming Offer Radar**: 30-second decision timer displaying passenger name, rating, pickup distance, gross fare, and net earnings (90%).
- **Manual Progression Controls**:
  - `Arrived at Pickup`: Notifies customer of driver arrival.
  - `Start Trip / In Transit`: Sets route to destination drop-off point.
  - `Simulate Next Step`: Incremental coordinate stepping broadcasting live marker updates to the customer map.
- **Earnings Wallet**: Live available balance, breakdown of platform cuts, and withdrawal request submission.
- **Vehicle Customization**: Real-time switching between Motorbike and Car classifications.

---

## 🗺️ Route Hierarchy & Protected Navigation

```
src/app/
├── (auth)/
│   ├── layout.tsx              # Ambient gradient branding layout
│   ├── login/page.tsx          # Single unified Customer/Driver login
│   └── register/page.tsx       # Unified registration with vehicle selection
├── (dashboard)/
│   ├── customer/page.tsx       # Protected Customer portal (allowedRoles: ['CUSTOMER'])
│   └── driver/page.tsx         # Protected Driver cockpit (allowedRoles: ['DRIVER'])
├── checkout/page.tsx           # Fallback test checkout / confirmation
├── customer/payment/
│   ├── success/page.tsx        # Stripe redirect verification & escrow handler
│   └── cancel/page.tsx         # Cancelled session cleanup & refund notice
├── layout.tsx                  # Root layout with AuthProvider & Toaster
├── page.tsx                    # Editorial landing page with CTAs & FAQ
└── globals.css                 # Tailwind 4 design system & custom keyframes
```

---

## 🗺️ Live Interactive Map System

Because Leaflet requires access to the browser `window` and `document` APIs, all map components are dynamically imported with Server-Side Rendering (SSR) disabled:

```tsx
const LiveRideMap = dynamic(() => import("@/components/common/LiveRideMap"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});
```

- **[`LeafletMap.tsx`](file:///home/reyan/dev/workshop/chalo-dockerized/chalo-client/src/components/common/LeafletMap.tsx)**: Interactive point selection inside the location modal.
- **[`RoutePreviewMap.tsx`](file:///home/reyan/dev/workshop/chalo-dockerized/chalo-client/src/components/common/RoutePreviewMap.tsx)**: Displays pickup pin (`P`), drop-off pin (`D`), and connecting dashed route line during booking.
- **[`LiveRideMap.tsx`](file:///home/reyan/dev/workshop/chalo-dockerized/chalo-client/src/components/common/LiveRideMap.tsx)**: Full tracking canvas displaying pickup, drop-off, and real-time updating vehicle marker (`🚗` or `🏍️`).

---

## 📡 Real-Time Socket State Synchronization

The frontend socket singleton (`@/lib/socket.ts`) manages active connection recovery and auto-rejoining:

| Emitted by Client | Purpose |
|---|---|
| `join:driver` | Driver registers role and vehicle type for incoming dispatch |
| `driver:online` | Marks driver available for matching |
| `driver:offline` | Unsubscribes driver from dispatch pool |
| `ride:join` | Joins isolated room `ride:<rideId>` for live tracking |
| `ride:leave` | Leaves completed or cancelled ride room |
| `driver:arrived` | Driver broadcasts arrival at pickup |
| `ride:started` | Driver marks trip as in-transit |
| `driver:location` | Driver broadcasts updated coordinates |

| Listened by Client | Reaction |
|---|---|
| `ride:requested` | Driver receives new ride request card with 30s countdown |
| `ride:accepted` | Customer updates UI with assigned driver details and vehicle info |
| `ride:taken` | Remaining drivers are notified to dismiss expired offer |
| `driver:arrived` | Customer is notified that driver is waiting outside |
| `ride:started` | Customer UI transitions into "In Transit" status |
| `driver:location` | Customer live map smoothly translates driver marker pin |
| `ride:completed` | Customer unlocks arrival review & star rating modal |
| `ride:no_driver` | Customer is alerted that hold was refunded due to no driver match |

---

## 🚀 Setup & Installation Guide

> [!NOTE]
> **Primary Deployment Workflow:**
> The primary and recommended method to run the Chalo client alongside the backend is via the root Docker Compose setup:
> ```bash
> # From the repository root (chalo-dockerized):
> docker compose up --build -d
> ```
> See the main [README.md](../README.md) for full instructions.

### Manual Non-Docker Local Development

#### Prerequisites
- Node.js `20.x` or higher
- Running instance of `chalo-backend` (port `4000`)

### Step-by-Step Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd chalo-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp -n .env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_API_URL` points to `http://localhost:4000/api`.

4. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables (.env.example)

```env
# Point to Chalo Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🧪 Production Build & Quality Verification

```bash
# Run production build with Turbopack and TypeScript verification
npm run build

# Start optimized production server
npm start
```
