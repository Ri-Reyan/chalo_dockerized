# Chalo Frontend Prototype Implementation Checklist

> Tracking progress for the Chalo ride-hailing web application frontend prototype (`chalo-client`).
> Based on `docs/design_spec.md` and `CHALO_PROJECT_GUIDE.md`.

---

## 1. Project Foundation & Design System Setup
- [x] Initialize project architecture with modular directories (`components/common`, `components/landing`, `components/customer`, `components/driver`, `layouts`)
- [x] Configure `globals.css` with exact design tokens for both themes:
  - **Softly Aesthetic (Landing):** `#FDFCF8` bg, Sage `#E8EFE8`, Lavender `#EFEDF4`, Coral `#FFB7B2`, Dark Stone `#292524`, Muted `#78716C`, floating blobs keyframes, noise grain overlay.
  - **Chalo Brand Theme (App/Dashboard):** Burgundy `#6f1b1b` bg, Card `#9a2121`, Gold `#d4b454`, Hover `#b45f06`, Border `#c8833b`.
- [x] Establish shared mock data and TypeScript interfaces for rides, users, and vehicles.

---

## 2. Landing Page (Sequential Execution)
- [x] **Section 1: Landing Page Navbar**
  - Floating pill-shaped container (70% white opacity, 20px backdrop blur, subtle shadow)
  - Circular Coral `#FFB7B2` logo with white inner dot & "Chalo" brand wordmark
  - Navigation anchors (`Home`, `Features`, `How It Works`, `Driver`, `FAQ`)
  - Pill CTA buttons: "Sign In" (ghost/outline) and "Book a Ride" / "Get Started" (dark stone `#292524`)
  - Mobile responsive drawer/menu toggle
- [x] **Section 2: Hero Section**
  - Centered vertical stack layout with max-width containment
  - Two large ambient blurred floating blobs (`#FFE4E1` and `#E6E6FA`) with gentle CSS animation
  - 72px sentence case headline with cursive emphasis: *"Skip the wait, embrace the journey"*
  - Muted lead paragraph (18px, `#78716C`)
  - Dual 48px pill CTA buttons: Primary Coral `#FFB7B2` ("Book a Ride") and Secondary Stone border ("Drive with Us")
  - Social proof trust badges (e.g., "⚡ 2.4 min avg pickup", "⭐ 4.9/5 satisfaction rating", "🛡️ 100% Vetted Drivers")
  - Interactive Instant Fare Calculator preview widget
- [x] **Section 3: Social Proof / Stats**
  - Impact metrics counter grid (Completed rides, active drivers, average rating, coverage cities)
  - Horizontal/grid cards with subtle rotation, sticky-note aesthetic, and cursive signatures
- [x] **Section 4: Problem Statement**
  - Highlight current ride-hailing pains (hidden surge pricing, driver cancellations, long wait times, cold corporate feel)
  - Before vs After comparison cards
- [x] **Section 5: Solution & Value Proposition**
  - Interactive feature highlights (fair pricing, guaranteed pickups, driver welfare)
  - 3-Phone Cascade App Preview with floating animations
  - Live Interactive Fare Estimate preview widget
- [x] **Section 6: How It Works**
  - Visual step-by-step guide for Riders (Set pickup -> Match driver -> Track live -> Arrive safely)
  - Tab switch for Drivers (Go online -> Accept request -> Pick up rider -> Get paid instantly)
- [x] **Section 7: FAQs Section**
  - Expandable accordion with 6-8 comprehensive questions
  - Smooth slide animations and plus/close rotational transitions
- [x] **Section 8: Footer with CTA**
  - 3-column structured footer with brand story, product links, driver links, and legal
  - Newsletter / Early access waitlist input with instant feedback
  - Social media icons and copyright details

---

## 3. Authentication Flows
- [x] Unified Auth Layout with Chalo Brand Theme (Burgundy `#6f1b1b` & Gold `#d4b454`)
- [x] Customer & Driver Login Page (`/login`)
  - Role switcher tab (Customer / Driver)
  - Email & password inputs with floating labels & validation
  - Demo quick-fill credentials for testing
- [x] Customer & Driver Registration Page (`/register`)
  - Customer registration form
  - Driver multi-step registration (Personal Info -> Vehicle Details -> Verification)

---

## 4. Customer Dashboard (`/dashboard/customer`)
- [x] Customer Layout with responsive sidebar (Request Ride, Ongoing Ride, Ride History, Profile, Sign Out)
- [x] Request Ride View (Interactive pickup/destination selection, vehicle type: Bike vs Car, distance & fare calculation)
- [x] Live Ride Tracking Screen (Simulated driver map movement, ETA counter, driver info card, Call/Cancel/SOS buttons)
- [x] Ride History View with detailed receipts and payment status
- [x] Customer Profile & Saved Places

---

## 5. Driver Dashboard (`/dashboard/driver`)
- [x] Driver Layout with sidebar, earnings summary card, and Online/Offline availability toggle
- [x] Available Requests View (Real-time incoming request card with 30s countdown, route info, estimated fare, Accept/Decline)
- [x] Ongoing Ride & Route Tracking (Interactive step machine: En route -> Arrived -> In transit -> Completed)
- [x] Driver Wallet & Withdrawal Screen (Current balance, payout request modal, transaction history)
- [x] Driver Ride History & Daily Statistics
- [x] Driver Profile & Vehicle Info

---

## 6. End-to-End Polish & Verification
- [x] Responsive testing across mobile (375px), tablet (768px), and desktop (1280px+)
- [x] Local storage state persistence for seamless cross-page prototype testing
- [x] Next.js production build (`next build`) zero-error validation