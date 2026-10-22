# 🚖 Chalo — Full-Stack Ride-Hailing Platform (Dockerized)

> **Chalo** (*"Let's Go!"*) is a full-stack urban ride-hailing web platform built with a high-concurrency event-driven architecture. It provides an intuitive ride booking and live tracking experience for passengers, an empowering dispatch cockpit with fair earnings for driver partners (90% net take-home pay), and an upfront Stripe escrow payment system ensuring verified funds and zero fare disputes.

---

## 📑 Table of Contents
1. [Project Overview & Purpose](#1-project-overview--purpose)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Repository Directory Structure](#4-repository-directory-structure)
5. [Prerequisites & Supported Tooling](#5-prerequisites--supported-tooling)
6. [How the Dockerized Architecture Works](#6-how-the-dockerized-architecture-works)
7. [Required Cloud Services & External Dependencies](#7-required-cloud-services--external-dependencies)
8. [Environment Configuration](#8-environment-configuration)
9. [First-Time Setup](#9-first-time-setup)
10. [Starting the Application](#10-starting-the-application)
11. [Verifying that the Application is Running](#11-verifying-that-the-application-is-running)
12. [Manual Testing Checklist](#12-manual-testing-checklist)
13. [Troubleshooting Guide](#13-troubleshooting-guide)
14. [Stopping & Restarting Containers](#14-stopping--restarting-containers)
15. [Database & Migration Warnings](#15-database--migration-warnings)
16. [Security Notes for Reviewers](#16-security-notes-for-reviewers)
17. [Known Limitations & Current Caveats](#17-known-limitations--current-caveats)
18. [Documentation Index & References](#18-documentation-index--references)

---

## 1. Project Overview & Purpose

Chalo addresses core reliability challenges in modern mobility systems:
- **Payment Security via Escrow:** Rides are dispatched only after upfront fare authorization via Stripe Checkout. Funds are held in escrow (`HELD`) and released to the driver's wallet (`CAPTURED`) upon customer arrival confirmation, eliminating unpaid trips and fare disputes.
- **Atomic Dispatch Locking:** Database-level conditional updates (`status === 'REQUESTED'`) guarantee race-condition safe driver acceptance; the first driver to accept receives the ride, and competing drivers immediately receive socket updates dismissing the offer card.
- **Bi-Directional Telemetry:** Real-time dispatching, driver arrival, trip progression, and cancellation events are broadcast over WebSockets using Socket.IO rooms.
- **Deterministic Driver Controls:** Robust, button-based driver control panels ("Arrived at Pickup", "Start Trip", coordinate stepping) replace battery-draining, permission-throttled browser GPS tracking loops for 100% reliable local testing.

---

## 2. High-Level Architecture

The platform is structured into two decoupled application layers backed by managed cloud infrastructure:

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  Next.js 16 (App Router, Standalone) + React 19 + Tailwind CSS 4 + Leaflet Maps   |
|  Container: chalo-client (Port 3000)                                              |
+-----------------------------------------+-----------------------------------------+
                                          |
                      HTTP REST           |         WebSocket (Socket.IO)
              (JSON / Cookies / Bearer)   |         (Bidirectional Real-Time)
                                          v
+-----------------------------------------------------------------------------------+
|                                 SERVICES LAYER                                    |
|  Node.js 22 + Express 5 + Socket.IO + Stripe SDK + Argon2 + Prisma 7 ORM          |
|  Container: chalo-backend (Port 4000)                                             |
|                                                                                   |
|  [ Auth Module ]       [ Ride Service ]       [ Matching Engine ]   [ Payments ]  |
|  Argon2 & Cookies      Haversine & Routing    Socket Room Broadcast Stripe Escrow |
+-----------------------------------------+-----------------------------------------+
                                          |
                        Prisma 7 ORM      |         REST Pipeline
                      (Connection Pool)   |         (Atomic Keys)
                                          v
+-----------------------------------------------------------------------------------+
|                            EXTERNAL PERSISTENCE LAYER                             |
|   PostgreSQL Database (Supabase)       |        Upstash Redis (Serverless)        |
|   - Users, Rides, Payments, Ledger     |        - Idempotency & Rate Limiting     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

### Backend (`chalo-backend`)
- **Runtime:** Node.js 22 (`node:22-bookworm-slim` container base ensuring native `argon2` and Prisma 7 query engine ABI compatibility)
- **Framework:** Express.js 5
- **Language:** TypeScript 6 (transpiled with `tsc`)
- **Database ORM:** Prisma ORM 7.10 with `@prisma/adapter-pg`
- **Real-Time Communication:** Socket.IO 4.8
- **Authentication:** Argon2id password hashing + JSON Web Tokens (`jsonwebtoken`)
- **Payments:** Stripe Node SDK 23
- **Validation:** Zod 4

### Frontend (`chalo-client`)
- **Framework:** Next.js 16.4 (App Router, multi-stage Docker build with `output: "standalone"`)
- **UI Library:** React 19 & Tailwind CSS 4
- **Interactive Mapping:** Leaflet 1.9 & React-Leaflet 5
- **State & Notifications:** React Context, Axios 1.20, Sonner 2
- **Real-Time Client:** Socket.IO Client 4.8

### Managed Cloud Infrastructure
- **Relational Database:** Supabase PostgreSQL (Session port 5432 & Transaction Pooler port 6543)
- **In-Memory Cache & Limiter:** Upstash Redis (HTTPS REST API protocol via `@upstash/redis`)
- **Payment Processing:** Stripe API (Hosted Checkout in Test Mode)

### Container Orchestration
- **Docker Compose:** Multi-service orchestration (`backend`, `frontend`) with container healthcheck coordination.

---

## 4. Repository Directory Structure

```
chalo-dockerized/
├── compose.yaml                # Root Docker Compose orchestrating frontend & backend
├── .gitignore                  # Root Git ignore rules (strict secret protection)
├── ARCHITECTURE.md             # Detailed System Architecture & ADR documentation
├── PRD.md                      # Product Requirements Document (As-Built baseline)
├── TODO.md                     # Implementation status checklist
├── README.md                   # Primary onboarding & developer guide (this document)
│
├── docs/
│   └── TESTING.md              # Comprehensive testing & quality verification guide
│
├── chalo-backend/              # Express 5, TypeScript, Socket.IO & Prisma backend
│   ├── Dockerfile              # Multi-stage production container build (Node 22)
│   ├── .dockerignore           # Context exclusion rules
│   ├── .env.docker.example     # Backend container environment template
│   ├── .env.example            # Non-Docker local development template
│   ├── package.json            # Scripts & backend dependencies
│   ├── src/                    # Domain modules (auth, customer, driver, matching)
│   ├── prisma/                 # Multi-file Prisma schemas & migrations
│   └── README.md               # Backend technical specification
│
└── chalo-client/               # Next.js 16 (App Router) & React 19 frontend
    ├── Dockerfile              # Multi-stage standalone container build
    ├── .dockerignore           # Context exclusion rules
    ├── .env.example            # Client development template (NEXT_PUBLIC_API_URL)
    ├── package.json            # Scripts & frontend dependencies
    ├── src/                    # App Router pages, Leaflet maps, auth context
    └── README.md               # Frontend technical specification
```

---

## 5. Prerequisites & Supported Tooling

Before setting up Chalo, ensure the following software is installed on your host system:

- **Docker Engine:** Version 20.10 or later
- **Docker Compose:** Version 2.0 or later (`docker compose` command)
- **Modern Web Browser:** Chrome, Firefox, Edge, or Safari with JavaScript and cookie support enabled
- **Active Cloud Accounts / Credentials:**
  - Supabase PostgreSQL database URL (accessible from the host machine over the Internet)
  - Upstash Redis REST URL and Bearer token
  - Stripe Test Account API keys (optional for initial startup; required for checkout)

---

## 6. How the Dockerized Architecture Works

1. **Two Services Only:** The root `compose.yaml` defines exactly two services: `backend` and `frontend`.
2. **Cloud-Hosted Persistence:** Database and Redis services are **not** containerized locally; the backend connects directly to existing managed cloud instances (Supabase and Upstash).
3. **Backend Service (`chalo-backend`):**
   - Built from `./chalo-backend/Dockerfile` using `node:22-bookworm-slim`.
   - Explicitly listens on `0.0.0.0:4000` and publishes port `4000:4000`.
   - Injects environment variables from `./chalo-backend/.env`.
   - Defines a native Node.js HTTP healthcheck querying `GET http://127.0.0.1:4000/`.
4. **Frontend Service (`chalo-client`):**
   - Built from `./chalo-client/Dockerfile` with Next.js `output: "standalone"`, reducing container image size to ~88 MB.
   - Listens on `0.0.0.0:3000` and publishes port `3000:3000`.
   - Configured with `depends_on: backend: condition: service_healthy` so the frontend starts only after the backend Express server is healthy and responding.
   - Injects build argument `NEXT_PUBLIC_API_URL=http://localhost:4000/api` during image creation.

---

## 7. Required Cloud Services & External Dependencies

| Service | Protocol / Mode | Required For | Where to Obtain |
| :--- | :--- | :--- | :--- |
| **Supabase PostgreSQL** | IPv4 Transaction Pooler (`:6543`) | User persistence, ride states, transactional ledger | Supabase Dashboard -> Project Settings -> Database -> Connection String (Mode: Transaction, IPv4) |
| **Upstash Redis** | HTTPS REST API | Rate limiting, session idempotency, pending ride staging | Upstash Console -> Redis Database -> REST API (URL & Bearer Token) |
| **Stripe** | REST API (Test Mode) | Upfront escrow payments and automatic refunds | Stripe Dashboard -> Developers -> API Keys (`sk_test_...`, `pk_test_...`) |

> [!IMPORTANT]
> **Upstash REST Protocol:**
> Chalo uses `@upstash/redis` over HTTPS REST requests. Standard TCP Redis URLs (`redis://`) will not work without an HTTP proxy.

---

## 8. Environment Configuration

### Backend Configuration (`chalo-backend/.env`)
The backend reads configuration exclusively from `chalo-backend/.env`.

| Variable | Requirement | Default / Purpose | Example Placeholder |
| :--- | :--- | :--- | :--- |
| `PORT` | Required | Express & Socket.IO internal port | `4000` |
| `NODE_ENV` | Required | Set to `development` for local HTTP testing | `development` |
| `CLIENT_URL` | Required | Allowed CORS origin and Socket handshake origin | `http://localhost:3000` |
| `DATABASE_URL` | Required | Supabase Transaction Pooler URL (`pgbouncer=true`, port 6543) | `"postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"` |
| `DIRECT_URL` | Optional | Direct session connection for Prisma migrations (port 5432) | `"postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"` |
| `UPSTASH_REDIS_REST_URL` | Required | Upstash Redis HTTPS REST endpoint | `"https://[YOUR_INSTANCE].upstash.io"` |
| `UPSTASH_REDIS_REST_TOKEN` | Required | Upstash Redis REST bearer authorization token | `"[YOUR_UPSTASH_REST_TOKEN]"` |
| `JWT_ACCESS_TOKEN` | Required | HMAC-SHA256 signature secret for short-lived access tokens (min 32 chars) | `"[RANDOM_32_CHAR_STRING]"` |
| `JWT_REFRESH_TOKEN` | Required | HMAC-SHA256 signature secret for 7-day refresh tokens (min 32 chars) | `"[RANDOM_32_CHAR_STRING]"` |
| `JWT_ACCESS_TOKEN_TIME` | Optional | Access token expiration duration | `"15m"` |
| `JWT_REFRESH_TOKEN_TIME` | Optional | Refresh token expiration duration | `"7d"` |
| `STRIPE_SECRET_KEY` | Optional* | Stripe test secret key (*needed for ride checkout) | `"sk_test_[YOUR_STRIPE_KEY]"` |
| `STRIPE_PUBLISHABLE_KEY` | Optional* | Stripe test publishable key (*needed for checkout) | `"pk_test_[YOUR_STRIPE_KEY]"` |

### Frontend Configuration (`NEXT_PUBLIC_*`)
- Next.js requires public environment variables to be prefixed with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_API_URL` is configured directly inside `compose.yaml` as a build argument:
  ```yaml
  args:
    NEXT_PUBLIC_API_URL: http://localhost:4000/api
  ```
- Because Next.js standalone mode bakes `NEXT_PUBLIC_*` variables directly into static JavaScript bundles at build time, no `.env` file is required in `chalo-client/` when running via Docker Compose.

> [!WARNING]
> **Strict Secret Protection:**
> Never commit `.env` files to Git. The repository root `.gitignore` strictly ignores `.env*` files while explicitly allowing safe templates.

---

## 9. First-Time Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ri-Reyan/chalo_dockerized.git
   cd chalo_dockerized
   ```

2. **Create your backend environment file safely:**
   ```bash
   # Copy the sanitized Docker template without overwriting existing files
   cp -n chalo-backend/.env.docker.example chalo-backend/.env
   ```

3. **Populate `chalo-backend/.env` with your cloud credentials:**
   Open `chalo-backend/.env` in an editor and insert your actual Supabase database connection string, Upstash Redis REST credentials, and random JWT secrets.

---

## 10. Starting the Application

Build the container images and launch both services in detached mode:

```bash
docker compose up --build -d
```

Compose executes the following sequence:
1. Compiles the backend TypeScript source on `node:22-bookworm-slim` and generates Prisma 7 client bindings.
2. Builds the frontend Next.js 16 standalone bundle with embedded API URL `http://localhost:4000/api`.
3. Starts container `chalo-backend`. During startup, the backend establishes database and Redis connections.
4. Once the backend passes its HTTP health check, Compose launches `chalo-client`.

---

## 11. Verifying that the Application is Running

### Check Container Status
```bash
docker compose ps
```
Both containers should show status `Up`, and `chalo-backend` should show `(healthy)`:
```text
NAME            IMAGE                  COMMAND                  SERVICE    STATUS                    PORTS
chalo-backend   chalo-backend:latest   "docker-entrypoint.s…"   backend    Up (healthy)              0.0.0.0:4000->4000/tcp
chalo-client    chalo-client:latest    "docker-entrypoint.s…"   frontend   Up                        0.0.0.0:3000->3000/tcp
```

### Probe the Backend Health Endpoint
```bash
curl -i http://localhost:4000/
```
Expected response:
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"Hello, World!","status":200}
```

### Open the Frontend Application
Navigate to [http://localhost:3000](http://localhost:3000) in your web browser. The Chalo landing page will display.

> [!NOTE]
> **Healthcheck Verification Scope:**
> The backend healthcheck verifies process responsiveness to HTTP traffic via `GET http://127.0.0.1:4000/`. Continuous active probing of remote database or Redis connectivity is not executed on every healthcheck interval. Database and Redis reachability are validated during initial application boot in `main()`.

---

## 12. Manual Testing Checklist

For full end-to-end verification instructions, see [docs/TESTING.md](file:///home/reyan/dev/workshop/chalo-dockerized/docs/TESTING.md).

Quick test workflow:
1. **Window 1 (Customer):** Open [http://localhost:3000/register](http://localhost:3000/register) and register as a **Customer**.
2. **Window 2 (Driver - Incognito):** Open [http://localhost:3000/register](http://localhost:3000/register) and register as a **Driver** with a **Car** or **Motorbike**.
3. **Driver Cockpit:** Toggle "Go Online" in Window 2.
4. **Book Ride:** In Window 1, select pickup and dropoff points on the Leaflet map and click "Confirm Booking".
5. **Stripe Checkout:** Enter Stripe test card `4242 4242 4242 4242` and complete payment.
6. **Accept Ride:** Window 2 receives a 30-second offer card via Socket.IO. Click "Accept Ride".
7. **Trip Controls:** In Window 2, click "Arrived at Pickup", "Start Trip", and step coordinates.
8. **Complete Trip:** In Window 1, click "Confirm Arrival". Funds release to driver wallet (90% take-home).

---

## 13. Troubleshooting Guide

| Symptom | Probable Cause | Diagnostic & Remedy |
| :--- | :--- | :--- |
| **Backend container exits with code 1** | Failed startup check in `main()` (Database or Upstash Redis unreachable). | Run `docker compose logs backend`. Confirm `DATABASE_URL` (ensure pooler port 6543 with `?pgbouncer=true` and IPv4) and `UPSTASH_REDIS_REST_*` credentials. |
| **Login succeeds but session drops immediately** | Cookies rejected due to `Secure` flag over HTTP. | Ensure `NODE_ENV=development` is set in `chalo-backend/.env`. If set to `production`, modern browsers reject `SameSite=None; Secure` cookies over plain HTTP `localhost`. |
| **Frontend displays "Unable to connect to backend"** | Port 4000 blocked, occupied, or backend failed to boot. | Verify `curl http://localhost:4000/` succeeds. Ensure no other host process is using port 4000 (`lsof -i :4000`). |
| **Driver does not receive ride offers** | Socket not in room or driver is offline. | Ensure driver has toggled "Go Online". Check browser console for `join:driver` socket emission. |
| **Ride cancellation fails with 500 error** | Schema drift: PostgreSQL enum `RideStatus` lacks `CANCELLED`. | Verify database schema contains `CANCELLED`. See warning in Section 15. |
| **Stripe Checkout fails or redirects to error** | Missing or invalid Stripe test secret key. | Supply valid `sk_test_...` key in `chalo-backend/.env` and restart containers. |

---

## 14. Stopping & Restarting Containers

### View Streaming Logs
```bash
# View all service logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View frontend logs only
docker compose logs -f frontend
```

### Stop the Application
```bash
# Stop and remove containers (network preserved)
docker compose down
```

### Restart the Application
```bash
# Restart existing containers
docker compose restart

# Rebuild images after code or environment template changes
docker compose up --build -d
```

---

## 15. Database & Migration Warnings

> [!CAUTION]
> **Prisma Migration Limitation for Fresh Databases:**
> The current Prisma schema (`prisma/schema/ride.prisma`) includes the enum value `RideStatus.CANCELLED`. However, the repository baseline migration (`prisma/migrations/20261020064246_init/migration.sql`) does not include that enum value.
>
> While the existing live Supabase database contains a compatible schema including `CANCELLED`, running `prisma migrate deploy` or `prisma db push` against a clean database will produce an incomplete enum that will cause ride cancellation workflows to fail.
>
> **Safety Rule for Reviewers:**
> Do **NOT** execute `npx prisma migrate dev`, `npx prisma migrate deploy`, `npx prisma db push`, seeds, or schema-altering commands against a shared production or staging database without an independent backup and recovery plan.

---

## 16. Security Notes for Reviewers

- **Zero Plaintext Secrets in Repository:** All sensitive credentials, database passwords, and API keys are strictly excluded via `.gitignore`.
- **Argon2id Password Hashing:** Passwords are salted and hashed using Argon2id, providing resistance against GPU-accelerated brute-force attacks.
- **Dual JWT Token Delivery:** Short-lived access tokens (15 minutes) and refresh tokens (7 days) are transmitted in HTTP-only cookies (`httpOnly: true, sameSite: "lax"` in development).
- **Payment PCI Compliance:** No credit card numbers or banking credentials ever touch Chalo application servers. All transactions are delegated to Stripe Hosted Checkout (PCI-DSS Level 1 compliant).
- **Rate-Limiting Infrastructure:** Express endpoints are protected by an atomic Upstash Redis sliding window pipeline preventing brute-force authentication attacks.

---

## 17. Known Limitations & Current Caveats

1. **Redis Startup Dependency:** The backend requires active Upstash Redis connectivity during boot (`await redis.set("foo", "bar")`). It will exit with code 1 if Redis is unreachable; there is no in-memory fallback.
2. **Build-Time Frontend API URL:** `NEXT_PUBLIC_API_URL` is baked into the Next.js standalone container bundle during the build step. Changing this URL requires rebuilding the frontend image (`docker compose up --build -d frontend`).
3. **Manual Driver Telemetry Stepping:** Driver movement is simulated via deterministic button controls rather than real-world GPS tracking to avoid browser permission issues in local test environments.
4. **Baseline Migration Drift:** The baseline migration lacks enum value `CANCELLED` (see Section 15).

---

## 18. Documentation Index & References

- **[System Architecture & ADRs](file:///home/reyan/dev/workshop/chalo-dockerized/ARCHITECTURE.md):** Complete technical architecture, transactional boundaries, and ADR specifications.
- **[Testing & Quality Verification Guide](file:///home/reyan/dev/workshop/chalo-dockerized/docs/TESTING.md):** Test scenarios, preflight checks, and testing checklist.
- **[Product Requirements Document (PRD)](file:///home/reyan/dev/workshop/chalo-dockerized/PRD.md):** As-built functional and non-functional requirements.
- **[Backend Technical Guide](file:///home/reyan/dev/workshop/chalo-dockerized/chalo-backend/README.md):** API route reference, Socket.IO room events, and Prisma models.
- **[Frontend Technical Guide](file:///home/reyan/dev/workshop/chalo-dockerized/chalo-client/README.md):** Next.js component hierarchy and client state architecture.
# chalo_dockerized
