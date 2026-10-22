# Chalo MVP — Master Implementation TODO

> **Scope Boundary:** This document outlines the exact, remaining work required to deliver a demonstrable, end-to-end working MVP of **Chalo** (Rider & Driver Web App). Unnecessary features outside the MVP scope (Stripe Connect, Redis GEO, BullMQ, SMS OTPs, background GPS daemons, user ratings, complex refunds) are strictly excluded.

---

## 📊 High-Level Status Summary

| Layer | Component | Status | Next Milestone |
| :--- | :--- | :--- | :--- |
| **Frontend** | Marketing Landing Page | **100% Done** | Production ready |
| **Frontend** | Auth UI (`/login`, `/register`) | **100% Done** | Connected to REST API & Auth Context |
| **Frontend** | Customer Dashboard (`/customer`) | **100% Done** | Connected with Leaflet, Stripe & Socket.IO |
| **Frontend** | Driver Dashboard (`/driver`) | **100% Done** | Real-time dispatch, acceptance & wallet |
| **Backend** | Database & Prisma Models | **100% Done** | Validated schemas |
| **Backend** | Auth Module (`/api/auth`) | **100% Done** | Register, Login, Me, Logout |
| **Backend** | Driver Module (`/api/drivers`) | **100% Done** | Status, Location, Balance, Withdraw |
| **Backend** | Ride Module (`/api/rides`) | **100% Done** | Estimate, Create, Accept, Arrive, Complete |
| **Backend** | Radius Matching Service | **100% Done** | 2 km → 4 km in-memory expansion |
| **Backend** | Socket.IO Server | **100% Done** | Auth handshake & room events |
| **Payment** | Stripe Integration | **100% Done** | Checkout Sessions, Verify, Hold & Payout |

---

## 🛠️ Phase 1: Backend Core Modules (`chalo-backend`)

### 1.1 Driver Module (`src/module/driver/`)
- [x] **`PATCH /api/drivers/status`**
  - Toggle driver `isOnline` boolean in database.
  - Require authenticated `DRIVER` role.
  - If toggled offline, remove from active matching candidate list.
- [x] **`PATCH /api/drivers/location`**
  - Update driver `lat` and `lng` coordinates in database.
  - Validate numeric coordinate bounds (`-90 <= lat <= 90`, `-180 <= lng <= 180`).
- [x] **`GET /api/drivers/balance`**
  - Return driver's current available earnings balance (`balance` field on `User`).
- [x] **`POST /api/drivers/withdrawals`**
  - Validate minimum withdrawal threshold ($10.00).
  - Verify driver has sufficient available balance.
  - **Transactionally**:
    1. Deduct requested amount from `User.balance`.
    2. Create a `Withdrawal` record with status `PENDING`.
  - Handle race conditions (prevent double-spending or negative balance).

### 1.2 Customer & Ride Management Module (`src/module/customer/ride/`)
- [x] **`POST /api/rides/estimate`**
  - Calculate straight-line distance between pickup and destination using the Haversine formula.
  - Calculate fare ($ USD):
    - **BIKE**: Base $1.00 + $0.20 / km
    - **CAR**: Base $3.00 + $0.50 / km
  - Return `{ distanceKm, fare, vehicleType }` (authoritative calculation).
- [x] **`POST /api/rides` (Pre-Payment Redis Staging & Stripe Checkout)**
  - Validate pickup coordinates, destination coordinates, and vehicle type.
  - Compute authoritative distance and fare server-side in USD ($).
  - Store temporary pending ride payload in **Redis** with a 15-minute TTL (`pending_ride:${tempRideId}`).
  - **Zero PostgreSQL rows inserted before payment authorization**.
  - Generate Stripe Checkout Session with `tempRideId` metadata.
  - Return temporary ride details & Stripe checkout session URL.
- [x] **`POST /api/payments/verify-session` (Postgres Insertion & 2km Dispatch)**
  - Verify Stripe session payment status (`paid` / `complete`).
  - Retrieve temporary payload from Redis.
  - **Transactionally insert**:
    1. Create `Ride` record in PostgreSQL (`status: REQUESTED`, `currentRadiusKm: 2.0`).
    2. Create `Payment` record in PostgreSQL (`status: HELD`).
  - Clean up temporary payload from Redis & record processed session.
  - Trigger initial radius matching (2.0 km dispatch with 30s expansion).
- [x] **`GET /api/rides/active`**
  - Fetch active ride (`REQUESTED` or `ACCEPTED`) for the authenticated user:
    - If `CUSTOMER`: where `customerId = user.id`.
    - If `DRIVER`: where `driverId = user.id`.
  - Return `null` if no ride is in progress.
- [ ] **`GET /api/rides/:id`**
  - Return ride details if requester is the customer or assigned driver.
- [x] **`POST /api/rides/:id/accept` (Atomic Driver Acceptance)**
  - Require authenticated `DRIVER` role.
  - Verify driver is online, vehicle type matches ride, and driver has no other active ride.
  - **Atomic database update**:
    ```sql
    UPDATE rides 
    SET driverId = :driverId, status = 'ACCEPTED', acceptedAt = NOW() 
    WHERE id = :rideId AND status = 'REQUESTED';
    ```
  - If 0 rows updated, return `409 Conflict` ("Ride has already been accepted by another driver").
  - On success: emit `ride:accepted` to customer and `ride:taken` to competing drivers.
- [x] **`POST /api/rides/:id/complete` (Customer Confirms Arrival)**
  - Require authenticated `CUSTOMER` role matching `ride.customerId`.
  - Verify ride status is currently `ACCEPTED`.
  - Calculate 90% driver take-home (`netEarnings = fare * 0.90`).
  - **Transactionally**:
    1. Update `Ride`: `status = 'COMPLETED'`, `completedAt = NOW()`.
    2. Update `Payment`: `status = 'CAPTURED'`.
    3. Update `User` (Driver): increment `balance += netEarnings`.
  - Emit `ride:completed` event via Socket.IO to ride room.

---

## 📡 Phase 2: Matching Engine & Real-Time Events (`chalo-backend`)

### 2.1 Radius Matching Engine (`src/module/matching/`)
- [x] **2.0 km Initial Match (Round 1)**:
  - Query online drivers whose `vehicleType` matches and whose distance to `pickup` is `<= 2.0 km` (using Haversine formula).
  - Emit `ride:new` to eligible drivers via their personal socket rooms (`user:${driverId}`) and `drivers:online`.
- [x] **30-Second Expansion to 4.0 km (Round 2)**:
  - Start an in-memory timer (30s) upon ride creation.
  - If ride is still `REQUESTED` after 30s:
    1. Update `Ride.currentRadiusKm = 4.0`.
    2. Query newly eligible online drivers between 2 km and 4 km.
    3. Emit `ride:new` to newly matched drivers.
- [x] **60-Second Timeout & Refund (Round 3)**:
  - If still `REQUESTED` after 60s:
    1. Update `Ride.status = 'NO_DRIVER_FOUND'`.
    2. Update `Payment.status = 'REFUNDED'`.
    3. Emit `ride:no_driver` to customer.
- [ ] **Matching Exhaustion / No Driver Found**:
  - If no driver accepts after 60s total:
    1. Update `Ride.status = 'NO_DRIVER_FOUND'`.
    2. Update `Payment.status = 'REFUNDED'`.
    3. Emit `ride:no-driver` to customer socket.

### 2.2 Socket.IO Server Setup (`src/lib/socket.ts`)
- [x] **Server Initialization & Auth Handshake**:
  - Attached Socket.IO to HTTP server in `server.ts`.
  - Configured CORS and user identification on handshake query.
- [x] **Room Management**:
  - Automatically join user to personal room: `user:${userId}`.
  - Driver availability room: `drivers:online`.
  - When ride is active, both customer and driver join `ride:${rideId}`.
- [x] **Event Handlers**:
  - Real-time dispatch `ride:new`, atomic resolution `ride:taken`, milestone transitions (`driver:arrived`, `ride:started`, `ride:completed`).
  - Driver coordinate streaming (`driver:location`) and disconnect cleanup.

---

## 💻 Phase 3: Client-Backend Integration (`chalo-client`)

### 3.1 API Client & Authentication Bridge
- [x] **API Service Layer (`src/lib/axios.ts`)**:
  - Configured Axios instance with base URL (`process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"`).
  - Enabled `withCredentials: true` for HTTP-only JWT cookie transmission (`accessToken`, `refreshToken`).
  - Standardized response error interceptor for backend AppError responses.
- [x] **Auth Context & Hook (`src/context/auth.context.tsx`)**:
  - `AuthProvider` and `useAuth` hook managing `user`, `isAuthenticated`, and `loading`.
  - `login()` calling `POST /api/auth/login` and handling role-based routing.
  - `register()` calling `POST /api/auth/register` and handling role-based routing.
  - `getMe()` on app mount calling `GET /api/auth/me` to restore active session from HTTP-only cookie.
  - `logout()` calling `POST /api/auth/logout`, clearing user state, and redirecting to `/login`.
- [x] **Route Protection & Role Guard (`src/components/auth/ProtectedRoute.tsx`)**:
  - Protects dashboard pages (`/customer` and `/driver`).
  - Redirects unauthenticated users to `/login?redirect=...`.
  - Prevents role cross-access (e.g., customer redirected away from `/driver`, driver redirected away from `/customer`).
- [x] **Connect Authentication Pages**:
  - Updated `src/app/(auth)/login/page.tsx` to submit to `POST /api/auth/login`.
  - Updated `src/app/(auth)/register/page.tsx` to submit to `POST /api/auth/register`.
  - Connected `Sign Out` buttons in sidebars to `logout()`.

### 3.2 Real-Time Socket Connection (`src/lib/socket.ts`)
- [x] Installed `socket.io-client`.
- [x] Created socket connection singleton with auto-reconnect and cookie authorization.
- [x] Helper functions `joinRideRoom`, `leaveRideRoom`, `joinUserChannel`.

### 3.3 Customer Dashboard Integration (`/customer`)
- [x] **Ride Estimate & Request** ([`RequestRideView.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/customer/RequestRideView.tsx)):
  - Calls `/api/rides/estimate` when pickup and destination coordinates are selected.
  - Initiates real Stripe Checkout Session (`/api/payments/create-checkout-session`).
  - Automatically redirects customer to Stripe checkout; on return, enters searching/active state.
- [x] **Live Journey Tracking** ([`LiveTrackingView.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/customer/LiveTrackingView.tsx)):
  - Listens for `ride:accepted` with driver details (name, vehicle, rating).
  - Listens for `driver:arrived` and `ride:started` status changes.
  - "I've Arrived" completion button: submits to `POST /api/rides/:id/complete`.
  - Listens for `ride:completed` to trigger completed payment summary and rating modal.
- [x] **Interactive Map (`Leaflet + OpenStreetMap`)**:
  - Modal location picker (`LocationPickerModal.tsx`) with reverse geocoding (Nominatim).
  - Standalone pure Leaflet route map showing pickup & destination pins.

### 3.4 Driver Dashboard Integration (`/driver`)
- [x] **Online/Offline Availability** ([`DriverSidebar.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/driver/DriverSidebar.tsx)):
  - Calls `PATCH /api/drivers/status` when driver toggles availability switch.
  - Updates location via `PATCH /api/drivers/location`.
- [x] **Available Requests Stream** ([`AvailableRequestsView.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/driver/AvailableRequestsView.tsx)):
  - Listens for `ride:new` socket events with 30s countdown timer.
  - Listens for `ride:taken` to remove offers accepted by competing drivers.
  - "Accept Trip" button: submits to `POST /api/rides/:id/accept`.
  - Handles `409 Conflict` gracefully ("Trip taken by another driver").
- [x] **Ongoing Ride Execution** ([`DriverOngoingRideView.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/driver/DriverOngoingRideView.tsx)):
  - Updates trip milestones: "Arrived at Pickup", "Start Ride".
  - Listens for `ride:completed` event triggered by customer arrival confirmation.
- [x] **Earnings & Wallet Payouts** ([`DriverWalletView.tsx`](file:///home/reyan/dev/workshop/chalo/chalo-client/src/components/driver/DriverWalletView.tsx)):
  - Loads driver balance from `GET /api/drivers/balance`.
  - Submits withdrawal requests to `POST /api/drivers/withdrawals`.
  - Renders balance and withdrawal ledger.

---

## 🧪 Phase 4: End-to-End Verification & Demonstration

- [ ] **Two-Browser Happy Path Test**:
  1. Open Browser Window 1: Login as **Driver** (`driver@chalo.app`), toggle **Online**, set location.
  2. Open Browser Window 2: Login as **Customer** (`customer@chalo.app`), select pickup & destination, click **Request Ride**.
  3. Verify payment status is `HELD` in database.
  4. Verify Driver receives `ride:new` offer within 2 km with 30s countdown.
  5. Driver clicks **Accept Ride** → customer instantly transitions to live tracking.
  6. Driver marks **Arrived** → clicks **Start Trip**.
  7. Customer clicks **Confirm Arrival** → ride marked `COMPLETED`.
  8. Verify payment updated to `CAPTURED` and Driver balance credited with 90% of fare.
  9. Driver opens **Wallet** → requests withdrawal of available balance.
- [ ] **Edge Case Validations**:
  - Competing acceptance: Two drivers attempt to accept the same ride simultaneously (ensure strictly 1 wins, other gets clean alert).
  - Timeout expansion: No driver accepts within 2 km → radius expands to 4 km after 30s.
  - No driver found: No driver in 4 km → ride status becomes `NO_DRIVER_FOUND` and held payment is refunded.

---

## 🚫 Out-of-Scope Checklist (Do NOT Implement for MVP)

- ❌ Real Stripe payments or bank transfers (Mock internal service only).
- ❌ Redis GEO spatial indices (Straight-line Haversine math is sufficient).
- ❌ BullMQ persistent queues (In-memory timers are explicitly approved).
- ❌ Continuous GPS background service (Manual/mock coordinates are sufficient).
- ❌ Turn-by-turn road routing APIs (Straight-line / simulated routes are sufficient).
- ❌ Ratings and customer review storage in database.
- ❌ Complex dispute, refund, or admin dashboard management systems.

