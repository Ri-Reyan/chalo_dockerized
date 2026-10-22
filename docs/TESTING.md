# 🧪 Chalo Testing & Quality Verification Guide

> **Target Audience:** Technical Interviewers, Reviewers, and QA Engineers  
> **Workspace:** `chalo-dockerized`  
> **Scope:** Containerized System Verification, API Endpoints, Real-Time WebSockets, and End-to-End User Workflows

---

## 📑 Table of Contents
1. [Overview & Testing Strategy](#1-overview--testing-strategy)
2. [Results Checklist & Verification Status](#2-results-checklist--verification-status)
3. [Phase 1: Automated Preflight & Container Checks](#3-phase-1-automated-preflight--container-checks)
4. [Phase 2: Service Health & HTTP Endpoint Probes](#4-phase-2-service-health--http-endpoint-probes)
5. [Phase 3: Browser-Based Manual Verification](#5-phase-3-browser-based-manual-verification)
   - [3.1 Authentication & Role Routing](#51-authentication--role-routing)
   - [3.2 Ride Estimation & Booking](#52-ride-estimation--booking)
   - [3.3 Stripe Escrow Payment](#53-stripe-escrow-payment)
   - [3.4 Driver Dispatch & Real-Time Socket.IO](#54-driver-dispatch--real-time-socketio)
   - [3.5 Driver Progression Controls](#55-driver-progression-controls)
   - [3.6 Trip Completion & Payout Settlement](#56-trip-completion--payout-settlement)
   - [3.7 Ride Cancellation & Auto-Refund](#57-ride-cancellation--auto-refund)
   - [3.8 Driver Wallet & Withdrawal Accounting](#58-driver-wallet--withdrawal-accounting)
6. [Troubleshooting Common Test Failures](#6-troubleshooting-common-test-failures)

---

## 1. Overview & Testing Strategy

The Chalo platform combines synchronous REST endpoints, asynchronous Socket.IO broadcasts, Stripe payment webhooks/sessions, and transactional PostgreSQL state changes. Testing is structured across three distinct operational layers:

1. **Previously Executed & Observed:** Tests run directly inside this workspace during Dockerization and verified healthy.
2. **Reviewer Manual Testing:** Step-by-step browser tests that an interviewer can execute in minutes using two browser windows (Customer and Driver).
3. **External Cloud Dependencies:** Tests that depend on active cloud services (Supabase PostgreSQL, Upstash Redis, and Stripe Test Mode).

> [!IMPORTANT]
> **No Automated Test Runner:**
> The repository does not include an automated end-to-end test suite (`npm test`). Do not run unverified test scripts. Verification relies on Docker Compose healthchecks, HTTP endpoint probing, and the manual test procedures documented below.

---

## 2. Results Checklist & Verification Status

| Test Identifier | Category | Verification Method | Status | Notes / Execution Observations |
| :--- | :--- | :--- | :--- | :--- |
| **TC-PRE-01** | Preflight | `docker compose config -q` | **PASS** | Compose configuration valid and verified. |
| **TC-BLD-01** | Build | `docker compose build` | **PASS** | Backend (`node:22-bookworm-slim`) & Frontend (Next.js standalone) built cleanly. |
| **TC-RUN-01** | Runtime | `docker compose ps` | **PASS** | `chalo-backend` running (healthy); `chalo-client` running. |
| **TC-RUN-02** | Healthcheck | `GET http://localhost:4000/` | **PASS** | Returned `{"message":"Hello, World!","status":200}` (HTTP/1.1 200 OK). |
| **TC-RUN-03** | Frontend Load | `GET http://localhost:3000/` | **PASS** | Returned HTTP 200 OK with rendered landing page HTML. |
| **TC-AUT-01** | Auth | Register new Customer | **MANUAL** | Execute via `/register` in browser. |
| **TC-AUT-02** | Auth | Register new Driver | **MANUAL** | Execute via `/register` selecting Driver role. |
| **TC-AUT-03** | Auth | Unified Login & Role Forward | **MANUAL** | Verify Customer routes to `/customer`, Driver to `/driver`. |
| **TC-AUT-04** | Auth | Cookie & Session Persistence | **MANUAL** | Refresh page; verify session remains active via `GET /api/auth/me`. |
| **TC-AUT-05** | Auth | Logout | **MANUAL** | Verify cookies cleared and redirected to `/login`. |
| **TC-RID-01** | Ride | Haversine Distance & Fare | **MANUAL** | Select pickup/dropoff on Leaflet map; verify upfront fare calculation. |
| **TC-PAY-01** | Payment | Stripe Checkout Escrow | **MANUAL** | Requires Stripe Test Keys (`sk_test_...`, `pk_test_...`). Test card `4242...`. |
| **TC-PAY-02** | Payment | Escrow Verification | **MANUAL** | Return from Stripe; verify session verified and payment marked `HELD`. |
| **TC-DSP-01** | Dispatch | Driver Online Toggle | **MANUAL** | Driver toggles "Go Online"; joins `drivers:online` Socket.IO room. |
| **TC-DSP-02** | Dispatch | Real-Time Offer Broadcast | **MANUAL** | Customer books ride; driver receives 30s countdown card via `ride:requested`. |
| **TC-DSP-03** | Dispatch | Atomic Driver Acceptance | **MANUAL** | Driver clicks "Accept Offer"; verify customer map transitions to active ride. |
| **TC-TRP-01** | Trip | Driver "Arrived at Pickup" | **MANUAL** | Driver clicks "Arrived"; customer receives `driver:arrived` notification. |
| **TC-TRP-02** | Trip | Driver "Start Trip" | **MANUAL** | Driver clicks "Start Trip"; customer receives `ride:started` notification. |
| **TC-TRP-03** | Trip | Driver Telemetry Stepping | **MANUAL** | Driver steps coordinates; customer live marker updates along polyline. |
| **TC-TRP-04** | Trip | Customer Confirms Arrival | **MANUAL** | Customer clicks "Confirm Arrival"; escrow captured (90% to driver, 10% cut). |
| **TC-CAN-01** | Cancel | Customer Ride Cancellation | **MANUAL** | Cancel before acceptance; triggers Stripe refund and sets status `CANCELLED`. |
| **TC-WLT-01** | Wallet | Driver Balance & Withdrawal | **MANUAL** | Inspect driver wallet; verify balance update and test withdrawal logging ($10 min). |

---

## 3. Phase 1: Automated Preflight & Container Checks

Before opening a browser, verify that Docker Compose starts the application cleanly:

### Step 1.1: Verify Compose Configuration
```bash
docker compose config -q
```
*Expected Result:* Clean exit with return code `0` (no syntax or schema errors).

### Step 1.2: Check Container Runtime Status
```bash
docker compose ps
```
*Expected Output:*
```text
NAME            IMAGE                  COMMAND                  SERVICE    STATUS                    PORTS
chalo-backend   chalo-backend:latest   "docker-entrypoint.s…"   backend    Up (healthy)              0.0.0.0:4000->4000/tcp
chalo-client    chalo-client:latest    "docker-entrypoint.s…"   frontend   Up                        0.0.0.0:3000->3000/tcp
```
- Both containers must display status `Up`.
- `chalo-backend` must show `(healthy)`.
- If `chalo-backend` shows `unhealthy` or exits with code 1, check logs immediately (`docker compose logs backend`).

---

## 4. Phase 2: Service Health & HTTP Endpoint Probes

Verify network and HTTP availability directly from the terminal:

### Step 2.1: Probe Backend Root Endpoint
```bash
curl -i http://localhost:4000/
```
*Expected Output:*
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"Hello, World!","status":200}
```

### Step 2.2: Inspect Backend Internal Health Check State
```bash
docker inspect --format='{{json .State.Health}}' chalo-backend
```
*Expected Output:*
`"Status":"healthy"` with `FailingStreak:0`.

> [!NOTE]
> **Healthcheck Verification Scope:**
> The backend healthcheck queries `GET http://127.0.0.1:4000/` using Node's native HTTP client. It confirms process responsiveness to HTTP requests. Continuous active validation of remote database or Redis connectivity is performed during application startup in `main()`, not on every 10-second healthcheck probe.

### Step 2.3: Probe Frontend Page Availability
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```
*Expected Output:*
`200`

---

## 5. Phase 3: Browser-Based Manual Verification

To test the multi-user ride-hailing flow, open two separate browser windows (or one regular window and one incognito window):
- **Window A (Customer):** [http://localhost:3000](http://localhost:3000)
- **Window B (Driver):** [http://localhost:3000](http://localhost:3000) (Incognito)

---

### 5.1 Authentication & Role Routing

#### TC-AUT-01: Register Customer Account
1. In Window A, navigate to [http://localhost:3000/register](http://localhost:3000/register).
2. Enter Name, Email, Password, and select the **Customer (Passenger)** role.
3. Submit registration.
4. **Verification:** System redirects to [http://localhost:3000/customer](http://localhost:3000/customer).

#### TC-AUT-02: Register Driver Account
1. In Window B (Incognito), navigate to [http://localhost:3000/register](http://localhost:3000/register).
2. Enter Name, Email, Password, select **Driver Partner** role, and select Vehicle Type (**Car** or **Motorbike**).
3. Submit registration.
4. **Verification:** System redirects to [http://localhost:3000/driver](http://localhost:3000/driver).

#### TC-AUT-03: Unified Login & Cookie Verification
1. Log out from either window using the user menu.
2. In [http://localhost:3000/login](http://localhost:3000/login), enter the Customer credentials.
3. **Verification:** Redirects to `/customer`.
4. Open browser DevTools -> Application -> Cookies -> `http://localhost:4000`:
   - `accessToken`: HTTP-only cookie present.
   - `refreshToken`: HTTP-only cookie present with 7-day expiration.
5. In Window B, log in with Driver credentials.
6. **Verification:** Redirects to `/driver`. Cross-role route access (e.g. Driver attempting to visit `/customer`) is automatically redirected.

---

### 5.2 Ride Estimation & Booking

#### TC-RID-01: Interactive Map & Dynamic Fare Calculation
1. In Window A (Customer Dashboard):
2. Click on the Leaflet map to select a **Pickup Location** (green pin).
3. Click on the Leaflet map to select a **Destination Location** (red pin).
4. Select vehicle type (**Motorbike** or **Car**).
5. **Verification:**
   - The map renders a polyline between pickup and destination.
   - Authoritative distance (km) and estimated fare ($ USD) are displayed:
     - **Motorbike**: Base $1.50 + $0.80 / km
     - **Car**: Base $3.00 + $1.50 / km
6. Click **Confirm Booking**.

---

### 5.3 Stripe Escrow Payment

> [!IMPORTANT]
> **Stripe Test Mode:** Requires valid test keys (`STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`) in `chalo-backend/.env`.

#### TC-PAY-01 & TC-PAY-02: Checkout & Verification
1. After confirming the booking, the customer is redirected to Stripe Checkout (`checkout.stripe.com`).
2. Enter standard Stripe test credentials:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/30`)
   - CVC: `123`
3. Click **Pay**.
4. Stripe redirects back to `http://localhost:3000/customer/payment/success?session_id=...`.
5. The frontend calls `POST /api/payments/verify-session`.
6. **Verification:**
   - A `Ride` record is transactionally created in Supabase (`status: REQUESTED`).
   - A `Payment` record is created (`status: HELD`).
   - The customer UI switches to the **Live Ride Search** animation (10-minute matching window).

---

### 5.4 Driver Dispatch & Real-Time Socket.IO

#### TC-DSP-01: Driver Online State
1. In Window B (Driver Dashboard):
2. Toggle the **Go Online** switch to **Online**.
3. **Verification:**
   - Driver status switches to `Online`.
   - Driver socket joins `drivers:online` and `driver_vehicle_<TYPE>`.

#### TC-DSP-02 & TC-DSP-03: Real-Time Offer & Atomic Acceptance
1. When the customer's ride request is confirmed, Window B instantly receives the offer via Socket.IO (`ride:requested`).
2. An interactive offer card appears displaying:
   - Pickup & Destination addresses / coordinates
   - Distance (km)
   - Gross Fare & Net Take-Home Pay (90%)
   - 30-second countdown timer
3. Click **Accept Ride** (`POST /api/rides/:id/accept`).
4. **Verification:**
   - Database atomically updates `Ride.status = 'ACCEPTED'` and sets `Ride.driverId`.
   - Driver UI switches to **Active Ride / Navigation** view.
   - Customer UI (Window A) instantly updates with driver details and vehicle information.

---

### 5.5 Driver Progression Controls

Chalo utilizes explicit driver action buttons to bypass fragile browser GPS tracking:

#### TC-TRP-01: Arrived at Pickup
1. In Window B, driver clicks **Arrived at Pickup** (`POST /api/rides/:id/arrived`).
2. **Verification:**
   - Window A (Customer) receives `driver:arrived` via Socket.IO.
   - Status badge updates to "Driver Arrived".

#### TC-TRP-02: Start Trip
1. In Window B, driver clicks **Start Trip** (`POST /api/rides/:id/start`).
2. **Verification:**
   - Window A receives `ride:started` via Socket.IO.
   - Status badge updates to "In Transit".

#### TC-TRP-03: Telemetry Progression Stepping
1. In Window B, click the coordinate simulation button to step the driver location along the route.
2. **Verification:**
   - Window A's Leaflet map smoothly animates the vehicle marker toward the destination.

---

### 5.6 Trip Completion & Payout Settlement

#### TC-TRP-04: Arrival Confirmation & Escrow Capture
1. When the trip finishes, the Customer (Window A) clicks **Confirm Arrival** (`POST /api/rides/:id/complete`).
2. **Verification:**
   - Database transaction executes:
     - `Ride.status` -> `COMPLETED`
     - `Payment.status` -> `CAPTURED`
     - `User.balance` (Driver) -> Incremented by 90% of fare
   - Window B (Driver) receives `ride:completed` event.
   - Window B displays congratulations screen with earnings summary.

---

### 5.7 Ride Cancellation & Auto-Refund

#### TC-CAN-01: Customer Cancellation Prior to Acceptance
1. Customer requests a ride and completes Stripe checkout.
2. While searching for a driver, customer clicks **Cancel Ride** (`POST /api/rides/:id/cancel`).
3. **Verification:**
   - Stripe refund API is invoked; `Payment.status` transitions to `REFUNDED`.
   - `Ride.status` transitions to `CANCELLED`.
   - Customer UI resets to the route request view.

> [!WARNING]
> **Database Schema Compatibility Note:**
> Ride cancellation requires that the PostgreSQL enum `RideStatus` contains `'CANCELLED'`. In the current live Supabase database, this value is present. However, on fresh databases initialized strictly from baseline migration `20261020064246_init`, `CANCELLED` is missing. See Section 15 of the root README for details.

---

### 5.8 Driver Wallet & Withdrawal Accounting

#### TC-WLT-01: Driver Earnings & Withdrawal Request
1. In Window B, navigate to the **Wallet** tab.
2. Verify available balance reflects completed trips.
3. Test withdrawal request (`POST /api/drivers/withdrawals`):
   - Enter amount below $10.00: Verify validation error (Minimum threshold is $10.00).
   - Enter valid amount (<= balance): Verify transaction creates `Withdrawal` with status `PENDING` and deducts amount from `User.balance`.

---

## 6. Troubleshooting Common Test Failures

| Test Area | Observed Symptom | Probable Cause | Diagnostic & Remedy |
| :--- | :--- | :--- | :--- |
| **Containers** | Backend container exits with code 1 | Cloud credentials missing or invalid database URL. | Run `docker compose logs backend`. Verify `DATABASE_URL` (IPv4 pooler on port 6543) and `UPSTASH_REDIS_REST_*` in `chalo-backend/.env`. |
| **Authentication** | Login succeeds but session lost on refresh | `Secure` cookie rejected on HTTP localhost. | Ensure `NODE_ENV=development` in `chalo-backend/.env`. If set to `production`, cookies require HTTPS. |
| **CORS / API** | Browser shows `Network Error` or CORS block | `CLIENT_URL` misconfigured. | Ensure `CLIENT_URL=http://localhost:3000` is set in `chalo-backend/.env`. |
| **Sockets** | Driver does not receive ride offers | Socket not joined to vehicle pool or offline. | Confirm Driver has toggled "Online". Inspect browser console for `join:driver` acknowledgment. |
| **Stripe** | Stripe checkout redirects to error | Missing or invalid Stripe test keys. | Supply valid `sk_test_...` and `pk_test_...` in `chalo-backend/.env` and restart backend. |
| **Cancellation** | 500 error when customer cancels ride | `CANCELLED` enum missing from PostgreSQL schema. | Verify Supabase database has `CANCELLED` in enum `RideStatus`. Do not run unapproved migrations. |

