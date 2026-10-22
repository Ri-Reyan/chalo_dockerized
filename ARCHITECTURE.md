# 🏛️ Chalo System Architecture Specification

> **Document Version**: 2.1 (Dockerized Monorepo Baseline)  
> **Status**: Verified Implementation  
> **Scope**: `chalo-backend`, `chalo-client`, and Docker Compose Orchestration

---

## 📑 Table of Contents
1. [Executive Architecture Summary](#1-executive-architecture-summary)
2. [Key Architectural Decisions (ADRs)](#2-key-architectural-decisions-adrs)
3. [Network Topology & Docker Orchestration](#3-network-topology--docker-orchestration)
4. [Data Flow & Transactional Boundaries](#4-data-flow--transactional-boundaries)
5. [Security, Cookie Handling & Fault Tolerance](#5-security-cookie-handling--fault-tolerance)
6. [Data Persistence & Migration Invariants](#6-data-persistence--migration-invariants)

---

## 1. Executive Architecture Summary

Chalo is an on-demand, multi-tier mobility platform architected with an event-driven decoupled model. The architecture is intentionally partitioned into two autonomous applications orchestrated via Docker Compose:
- **Presentation Layer (`chalo-client`)**: A React 19 / Next.js 16 single-page web client leveraging server-side rendered layouts and client-hydrated dynamic route modules (containerized with Next.js standalone output).
- **Application & Ingestion Layer (`chalo-backend`)**: An Express.js 5 backend (containerized with `node:22-bookworm-slim` to ensure native `argon2` and Prisma 7 engine compatibility) operating dual protocols: REST over HTTP for transactional commands and WebSocket over Socket.IO for telemetry and state propagation.
- **External Data & Persistence Layer**: Managed PostgreSQL (hosted on Supabase) accessed through the Prisma 7 Object-Relational Mapper with connection pooling, complemented by Upstash Redis for serverless rate-limiting and temporary ride caching.

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

## 2. Key Architectural Decisions (ADRs)

### ADR-001: Unified Authentication with Role-Based Forwarding
- **Decision**: Reject separate login interfaces for drivers and customers; deploy a single unified `/login` route.
- **Rationale**: Eliminates redundant context providers, duplicate cookies, and user confusion. The backend evaluates the authenticated user's role (`CUSTOMER` vs `DRIVER`) and routes to the appropriate dashboard with ProtectedRoute guards.
- **Implementation**: Argon2 password hashing, dual JWT delivery (HTTP-only cookies for cross-origin security + localStorage bearer header fallback for cross-site cookie restrictions).

### ADR-002: Upfront Stripe Checkout Escrow Architecture
- **Decision**: Rides are only dispatched to the driver pool *after* successful upfront fare authorization via Stripe Checkout.
- **Rationale**: Prevents driver cancellations caused by customer payment failure. Funds are held in escrow (`HELD`) and released to the driver's wallet (`CAPTURED`) upon customer arrival confirmation.
- **State Handling**: If no driver accepts or the ride is cancelled before pickup, funds are automatically refunded (`REFUNDED`) via Stripe refund APIs without manual dispute overhead.

### ADR-003: Driver Manual Controls over Fragile Browser Geolocation
- **Decision**: Replace `navigator.geolocation.watchPosition` and background GPS loops with a manual, button-based driver control panel.
- **Rationale**: Mobile browsers throttle background timers, request intrusive permissions, and frequently fail on desktop testing environments. The manual control panel ("Arrived at Pickup", "Start Trip", and coordinate step simulation) guarantees 100% deterministic testing and real-time state broadcasts.

### ADR-004: Universal Online Driver Dispatching (Zero Radius Limit)
- **Decision**: Remove restrictive geographic search radius thresholds (previously 2.0 km / 4.0 km) and extend the matching window to 10 minutes.
- **Rationale**: Prevents premature automated refunding when drivers take more than 30 seconds to review ride details or operate in distributed suburban territories.

### ADR-005: SSR-Safe Hydration Protocol
- **Decision**: Initialize authentication and user state consistently during SSR, delaying `localStorage` hydration until post-mount `useEffect`.
- **Rationale**: Prevents Next.js / React 19 hydration mismatches where the server renders an unauthenticated empty shell while the client hydrates with stored session data.

---

## 3. Network Topology & Docker Orchestration

### Service Ports and Host Binding
- **`backend` service:**
  - Container port: `4000` (bound to `0.0.0.0:4000` inside container)
  - Published host port: `4000:4000`
  - Internal endpoint for health probes: `http://127.0.0.1:4000/`
- **`frontend` service:**
  - Container port: `3000` (bound to `0.0.0.0:3000` inside container)
  - Published host port: `3000:3000`

### Browser-Facing Network Access
Because client-side React code executes in the user's browser (the host environment), all client network traffic targets host-published ports directly:
- **REST API URL:** `http://localhost:4000/api`
- **Socket.IO Real-Time URL:** `http://localhost:4000` (derived dynamically from `NEXT_PUBLIC_API_URL` by stripping `/api`)

### Build-Time Environment Injection
Next.js requires client-visible environment variables (`NEXT_PUBLIC_*`) to be available at compile time. In `compose.yaml`:
```yaml
frontend:
  build:
    context: ./chalo-client
    args:
      NEXT_PUBLIC_API_URL: http://localhost:4000/api
```
This URL is embedded directly into the standalone client bundle during image creation.

### Readiness & Healthcheck Coordination
- `compose.yaml` configures an HTTP-based healthcheck on the backend service:
  ```yaml
  test: ["CMD", "node", "-e", "const http = require('http'); const req = http.get('http://127.0.0.1:4000/', (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.setTimeout(2000, () => { req.destroy(); process.exit(1); });"]
  ```
- The frontend specifies `depends_on: backend: condition: service_healthy`.
- **Healthcheck Scope:** The probe verifies that Express is active and answering HTTP requests. Continuous active validation of remote database or Redis connectivity is performed during application startup in `main()`, not on every healthcheck cycle.

---

## 4. Data Flow & Transactional Boundaries

```
Customer                Client Router              Backend API              PostgreSQL            Stripe API
   |                          |                         |                        |                    |
   |-- 1. Select Route ------>|                         |                        |                    |
   |-- 2. Confirm Booking --->|-- POST /api/rides ----->|                        |                    |
   |                          |                         |-- Create Temp Ride --->|                    |
   |                          |                         |-- Init Checkout --------------------------->|
   |                          |<- Return Session URL ---|<-- Return Session URL ----------------------|
   |<- 3. Redirect to Stripe -|                         |                        |                    |
   |                          |                         |                        |                    |
   |-- 4. Complete Payment -------------------------------------------------------------------------->|
   |                          |                         |                        |                    |
   |-- 5. Land on Success --->|-- POST verify-session ->|                        |                    |
   |                          |                         |-- Verify Paid Session --------------------->|
   |                          |                         |-- BEGIN TRANSACTION -->|                    |
   |                          |                         |   Create Ride & Payment|                    |
   |                          |                         |-- COMMIT TRANSACTION ->|                    |
   |                          |                         |                        |                    |
   |                          |                         |-- Broadcast ride:requested (Socket.IO)      |
   |                          |<- Return Confirmed -----|                        |                    |
   |<- 6. Live Ride Search ---|                         |                        |                    |
```

---

## 5. Security, Cookie Handling & Fault Tolerance

### 1. Cookie Policy & Local Development
In `chalo-backend/src/global/cookie.ts`:
```typescript
const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.CLIENT_URL?.startsWith("https"));

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
};
```
- In **development** (`NODE_ENV=development` over `http://localhost:3000`), `secure: false` and `sameSite: "lax"` allow cookies to persist over unencrypted localhost.
- In **production** or over HTTPS, `secure: true` and `sameSite: "none"` are enforced to protect cross-site sessions.

### 2. Token Life Cycles
- Access tokens expire in 15 minutes (`JWT_ACCESS_TOKEN_TIME`).
- Refresh tokens expire in 7 days (`JWT_REFRESH_TOKEN_TIME`) with automatic token rotation in `auth.middleware.ts`.

### 3. Rate Limiting & Abuse Prevention
- An atomic Upstash Redis sliding window pipeline prevents brute-force login and spam ride generation (`max: 10` requests per 15-minute window on auth routes).

### 4. Service Startup & Upstash Redis Invariant
- Backend startup in `src/server.ts` requires active connectivity to Upstash Redis:
  ```typescript
  await redis.set("foo", "bar", { ex: 60 });
  ```
- If Upstash Redis is unreachable or credentials are missing, the server halts with `process.exit(1)`. There is **no in-memory fallback**.

---

## 6. Data Persistence & Migration Invariants

### Cloud Persistence Architecture
- **Supabase PostgreSQL:**
  - `DATABASE_URL`: Transaction-mode connection pooler on port 6543 (`?pgbouncer=true`). Required for runtime queries.
  - `DIRECT_URL`: Direct session connection on port 5432. Required for Prisma schema migrations.
- **Upstash Redis:** Serverless HTTPS REST protocol.

### Known Schema Drift Caveat
- `prisma/schema/ride.prisma` includes the enum value `RideStatus.CANCELLED`.
- The baseline migration `prisma/migrations/20261020064246_init/migration.sql` lacks `CANCELLED` in its `CREATE TYPE "RideStatus" AS ENUM (...)` statement.
- The existing Supabase cloud database already includes the `CANCELLED` enum value. However, executing `prisma migrate deploy` or `prisma db push` against a new, unmigrated database will omit `CANCELLED`, causing cancellation flows to throw database errors.
- Schema modifications must not be run without explicit review and a dedicated migration script.

### 2. Token Life Cycles
- Access tokens expire in 15 minutes (`JWT_ACCESS_TOKEN_TIME`).
- Refresh tokens expire in 7 days (`JWT_REFRESH_TOKEN_TIME`) with automatic token rotation in `auth.middleware.ts`.

### 3. Rate Limiting & Abuse Prevention
- An atomic Upstash Redis sliding window pipeline prevents brute-force login and spam ride generation (`max: 10` requests per 15-minute window on auth routes).

### 4. Service Startup & Upstash Redis Invariant
- Backend startup in `src/server.ts` requires active connectivity to Upstash Redis:
  ```typescript
  await redis.set("foo", "bar", { ex: 60 });
  ```
- If Upstash Redis is unreachable or credentials are missing, the server halts with `process.exit(1)`. There is **no in-memory fallback**.

---

## 6. Data Persistence & Migration Invariants

### Cloud Persistence Architecture
- **Supabase PostgreSQL:**
  - `DATABASE_URL`: Transaction-mode connection pooler on port 6543 (`?pgbouncer=true`). Required for runtime queries.
  - `DIRECT_URL`: Direct session connection on port 5432. Required for Prisma schema migrations.
- **Upstash Redis:** Serverless HTTPS REST protocol.

### Known Schema Drift Caveat
- `prisma/schema/ride.prisma` includes the enum value `RideStatus.CANCELLED`.
- The baseline migration `prisma/migrations/20261020064246_init/migration.sql` lacks `CANCELLED` in its `CREATE TYPE "RideStatus" AS ENUM (...)` statement.
- The existing Supabase cloud database already includes the `CANCELLED` enum value. However, executing `prisma migrate deploy` or `prisma db push` against a new, unmigrated database will omit `CANCELLED`, causing cancellation flows to throw database errors.
- Schema modifications must not be run without explicit review and a dedicated migration script.

