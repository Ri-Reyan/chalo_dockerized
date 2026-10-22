# 📋 Chalo Product Requirements Document (PRD)

> **Document Version**: 2.0 (Post-Implementation As-Built Baseline)  
> **Status**: Complete & Verified Implementation  
> **Applications**: `chalo-client` & `chalo-backend`

---

## 1. Product Mission & Goals

### 1.1 Mission
Chalo is an on-demand, transparent urban mobility application delivering instant ride booking, fair driver take-home earnings (90% payout), and verified upfront payment escrow to eliminate ride cancellations and fare disputes.

### 1.2 Target Personas
1. **The Passenger (Customer)**:
   - Needs an effortless way to select pickup and destination locations on an interactive map.
   - Demands upfront price transparency with zero surprise surcharges.
   - Wants secure digital card payments with instant automated refunds if no driver is available.
   - Requires live real-time journey tracking and arrival verification.

2. **The Driver Partner**:
   - Wants a simple toggle to go online and receive nearby ride offers.
   - Demands transparent earnings breakdowns (Gross Fare vs 90% Net Take-Home vs 10% Platform Cut).
   - Needs clear step-by-step trip controls without battery-draining GPS errors.
   - Requires an instant in-app wallet to monitor balance and request withdrawals.

---

## 2. Functional Requirements Matrix

| ID | Feature Module | Requirement Description | Implementation Status |
|---|---|---|---|
| **FR-01** | Unified Auth | Single `/login` page supporting both Customer and Driver credentials. | ✅ Implemented |
| **FR-02** | Role-Based Guard | Automatic post-login routing and route protection preventing cross-role access. | ✅ Implemented |
| **FR-03** | Route & Distance | Dynamic Haversine distance computation between pickup and destination coordinates. | ✅ Implemented |
| **FR-04** | Vehicle Pricing | Motorbike ($1.50 base + $0.80/km) and Car ($3.00 base + $1.50/km) pricing tiers. | ✅ Implemented |
| **FR-05** | Stripe Escrow | Upfront Checkout Session holding fare in `HELD` status prior to driver dispatch. | ✅ Implemented |
| **FR-06** | Real-time Matching | Socket.IO broadcast of `ride:requested` to online drivers with 30s acceptance card. | ✅ Implemented |
| **FR-07** | Atomic Acceptance | Race-condition safe acceptance locking ride to the first responding driver. | ✅ Implemented |
| **FR-08** | Driver Controls | Manual button panel for driver arrival, trip start, and coordinate telemetry stepping. | ✅ Implemented |
| **FR-09** | Live Ride Tracking | Interactive Leaflet map synchronizing driver position and passenger pickup/destination. | ✅ Implemented |
| **FR-10** | Escrow Capture | Customer arrival confirmation releasing 90% net earnings to driver balance. | ✅ Implemented |
| **FR-11** | Auto-Refund Engine | 10-minute timeout or manual customer cancellation triggers automatic Stripe refund. | ✅ Implemented |
| **FR-12** | Driver Wallet | Real-time balance display and withdrawal request logging with audit history. | ✅ Implemented |

---

## 3. Non-Functional Requirements

### 3.1 Performance & Latency
- Socket event delivery under 100ms across active rooms.
- Client route transitions under 200ms with SSR hydration safety.
- Database query response times under 50ms using pooled connections.

### 3.2 Security & Data Privacy
- Password hashing with Argon2id.
- JWT Access Tokens (15 min) & Refresh Tokens (7 days) in HTTP-only, secure cookies.
- Serverless rate-limiting on authentication and payment endpoints via Upstash Redis.
- Zero plaintext storage of payment card numbers (fully delegated to Stripe PCI-DSS Level 1 infrastructure).

### 3.3 Reliability & Fault Recovery
- Automatic reconnect and room rejoining in Socket.IO client upon network disruption.
- Idempotency checks on payment verification to prevent double-charging or duplicate ride creation.
- Fail-fast startup validation requiring active Upstash Redis connectivity (no in-memory fallback).

