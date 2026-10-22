# Chalo Ride-Hailing: Complete Design Specification

## Project Overview

Chalo is a simplified ride-hailing web application. This spec covers the complete MVP flow:

1. Public landing page (marketing)
2. Authentication flows (customer & driver signup/login)
3. Customer booking experience (pickup → destination → confirmation → live tracking)
4. Driver experience (registration → go online → accept rides → live tracking)
5. Payment & completion flows

---

## Part 1: Visual Design System

### 1.1 Landing Page Design ("Softly" Aesthetic)

**Purpose**: Market the app to new users with a warm, minimalist, wellness-focused vibe.

**Color Palette**:

- Background: #FDFCF8 (off-white)
- Sage: #E8EFE8
- Lavender: #EFEDF4
- Primary Accent (Coral): #FFB7B2
- Dark Text: #292524
- Muted Text: #78716C

**Typography**:

- Primary: Outfit (Sans-serif), 48px-96px for headings, tracking-tight (-0.025em)
- Accent: Reenie Beanie (Cursive), 24px-32px for emphasis
- Body: Outfit Medium, 16px-18px

**Visual Effects**:

- Global grain overlay: 35% opacity SVG fractal noise
- Border radius: 2rem (32px) to 4rem (64px) for containers
- Soft shadows: 0 4px 20px -2px rgba(0,0,0,0.05)
- Floating blob animations: 6s loop, translateY ±10px

**Animations**:

- Reveal on scroll: translateY 30px → 0, opacity 0 → 1, duration 0.8s
- Button hover: scale 1.02, shadow intensifies
- Smooth transitions: 300ms ease-out

---

### 1.2 App Experience Design (Chalo Brand Theme)

**Purpose**: Functional, trust-building, accessible ride-hailing interface.

**Color Palette**:

```css
:root {
  --bg-main: #6f1b1b; /* Dark burgundy background */
  --bg-card: #9a2121; /* Slightly lighter burgundy for cards */
  --accent-primary: #d4b454; /* Gold CTA buttons, highlights */
  --accent-hover: #b45f06; /* Darker gold on hover */
  --border-color: #c8833b; /* Borders and dividers */
  --text-light: #ffffff; /* Text on dark backgrounds */
  --text-dark: #2a2a2a; /* Text on light backgrounds */
  --success: #4caf50; /* Ride accepted, status updates */
  --warning: #ff9800; /* Alerts, matching timeouts */
  --error: #f44336; /* Errors, cancellations */
  --neutral-bg: #f5f5f5; /* Light backgrounds for inputs */
}
```

**Typography**:

- Primary: Outfit (Sans-serif), clean and modern
- Headings: 28px-36px, semi-bold (600)
- Body text: 14px-16px, regular (400)
- Form labels: 12px-14px, medium (500)
- Call-to-action: 16px, bold (700)

**Visual Style**:

- Border radius: 12px-16px (modern, friendly)
- Soft shadows: 0 2px 8px rgba(0,0,0,0.1)
- Card elevation: Layered depth with subtle shadow increases on hover
- Icons: Rounded, consistent stroke weight (2px)
- Input fields: Rounded corners (12px), border #c8833b, focus ring in gold
- Buttons: Rounded (12px), gold background, white text, scale 0.98 on press

**Animations**:

- Transitions: 200ms ease-out (standard)
- Loading states: Spinning ring animation on buttons
- Location updates: Smooth map marker animations (300ms)
- Notification toast: Slide in from top, auto-dismiss after 4s
- Form validation: Shake effect (50px horizontal, 150ms) on invalid input

---

## Part 2: Key Screens & Components

### 2.1 Landing Page Sections

#### Navigation Bar

- Floating pill-shaped nav: 70% white opacity, 20px backdrop-blur
- Logo: Small circular 32px avatar in Coral #FFB7B2 with white dot center
- Links: Home, About, Driver, Contact (14px Outfit Medium)
- CTA button: "Get Started" in dark stone #292524, rounded-full, 12px padding
- Position: Fixed at top, z-index 100, margin 16px from edges
- Width: 100% - 32px (mobile), centered container (desktop)

#### Hero Section

- Layout: Center-aligned, vertical stack
- Background: Two large blurred blobs (#FFE4E1 and #E6E6FA) at 60% opacity, floating animation
- Headline: 72px Outfit, Sentence case, with one handwritten word in Reenie Beanie
  - Example: "Skip the wait, _embrace_ the journey"
- Sub-headline: 18px Outfit, #78716C, max-width 500px, line-height 1.6
- CTAs: Two pill buttons (48px height)
  - Primary: #FFB7B2 (Coral), white text, soft shadow
  - Secondary: White background, #292524 border (1px), stone text
- Spacing: 64px top/bottom, 24px between elements

#### Horizontal Scroll: "Why Chalo?"

- Container: Full width, 20px padding
- Card specs: 288px width, 160px height, white background, rounded-3xl (24px)
- Card content:
  - Top-left: Timestamp in 14px #78716C
  - Bottom: 20px #292524 text (feature title)
  - On hover: Text color → #FFB7B2, shadow → 0 8px 24px rgba(0,0,0,0.1)
- Scroll behavior: Horizontal snap-scroll, momentum scrolling on mobile
- Cards content examples:
  1. "Instant matching" - Drivers within 2km notified instantly
  2. "Real-time tracking" - See your driver's live location
  3. "Transparent pricing" - No surge pricing surprises
  4. "Driver vetted" - All drivers background-checked
  5. "Safe rides" - Emergency contact + SOS features

#### App Preview (3-Phone Cascade)

- Center phone: 300x620px, fully opaque, screen content in Coral #FFB7B2
  - Screen content: "Breathe" button (animated pulse, 2s cycle)
  - Background: White, rounded-3xl frame
- Left phone: 280x580px, 80% opacity, translateY +48px, Sage #E8EFE8 screen
- Right phone: 280x580px, 80% opacity, translateY +96px, Lavender #EFEDF4 screen
- All phones: Dark border (2px, #292524), realistic shadow
- Animation: Gentle floating motion, 6s loop, ±8px vertical

#### Testimonials / Social Proof

- Grid: 2 columns (desktop), 1 column (mobile)
- Card: White background, 12px padding, slight rotation (±1 degree), shadow 0 4px 12px rgba(0,0,0,0.08)
- Content:
  - Quote: 18px Outfit, #292524, italic
  - Signature line: 32px horizontal line, below is "Reenie Beanie" cursive, 24px #78716C
  - Name: 14px Outfit Semi-bold, below signature
- Cards should feel like handwritten sticky notes

#### Waitlist Conversion

- Section background: Gradient overlay with floating blurred shapes
- Center alignment, 60% of viewport width
- Icon: 64px square with rounded corners, #292524 background, Coral #FFB7B2 dot (16px) centered
- Headline: 36px Outfit, #292524, "Join our community"
- Sub-text: 16px #78716C, max-width 400px
- Form:
  - Email input: rounded-full (24px radius), bg-stone-50, placeholder gray
  - Submit button: 48px height, #292524 background, white text, "Join now"
  - On hover: Scale 1.04, shadow intensifies
  - Loading state: Spinner inside button, text hidden
- Success message: Green toast notification, "Check your email!"

#### FAQ Accordion

- Container: White background, 16px rounded corners, 1px #c8b5a0 border
- Sections: 6-8 FAQ items
- Header: 24px padding, 500 weight, plus icon (16px)
  - On open: Icon rotates 45 degrees (200ms transition)
  - Cursor: pointer
  - Background: Hover state #fefaf3
- Content: Smooth collapse/expand, height 0 → auto, duration 500ms ease-in-out
- Text: 16px #78716C, bottom padding 24px

#### Footer

- Background: #292524 (dark)
- Layout: 3-column grid (desktop), single column (mobile)
- Columns:
  1. Logo + "Chalo is the future of mobility"
  2. Links: About, Blog, Careers, Press
  3. Social icons: LinkedIn, Twitter, Instagram
- Copyright: 12px, centered bottom, opacity 0.6

---

### 2.2 Authentication Flows (Chalo Brand Theme)

#### Shared Layout

- Background: --bg-main (#6f1b1b)
- Card: --bg-card (#9a2121), centered, 360px width (mobile), max-width 480px (desktop)
- Form fields: 44px height, 12px padding, --border-color border (1px), rounded 12px
- Labels: 12px, semi-bold, margin-bottom 8px
- Error messages: --error (#f44336), 12px, margin-top 4px
- Submit buttons: Full width, 48px height, --accent-primary background, white text, bold 700

#### Customer Registration

- Headline: "Create your Chalo account", 28px
- Fields:
  1. Full name (text)
  2. Email (email)
  3. Phone number (tel, formatted)
  4. Password (password)
  5. Confirm password (password)
- Checkbox: "I agree to Terms & Privacy", 12px
- Submit button: "Sign up", on hover scale 0.98, loading spinner
- Link: "Already have an account? Sign in", 14px, --accent-primary color

#### Customer Login

- Headline: "Welcome back", 28px
- Fields:
  1. Email (email)
  2. Password (password)
- Checkbox: "Keep me signed in", 12px
- Link: "Forgot password?", 14px, right-aligned
- Submit button: "Sign in"
- Link: "Don't have an account? Sign up", 14px, --accent-primary color

#### Driver Registration (Additional Steps)

- Same as customer, plus:
  1. Vehicle type selector (radio buttons: Economy, Comfort, Premium)
  2. Vehicle registration number (text)
  3. License number (text)
  4. Insurance provider & number (text)
  5. Bank account (text, for payouts)
  6. Background check consent (checkbox)
- Multi-step form: 3 sections (Personal, Vehicle, Verification)
  - Section indicator: "Step 2 of 3", 12px, --border-color
  - Progress bar: Full width, --accent-primary fill
- Next/Back buttons: 44px height, secondary style on Back

---

### 2.3 Customer Booking Flow (Chalo Brand Theme)

#### Dashboard/Home

- Top bar: User name, 24px semi-bold; "Account" link, "Sign out" link
- Sections:
  1. "Recent rides" (if any): Horizontal scroll of ride cards
     - Card: 280px width, --bg-card background, rounded 16px
     - Content: Driver name, vehicle type, date, cost, "Rebook" button
  2. "Book a ride" CTA: Large button, --accent-primary, 56px height
  3. "Wallet balance": Card showing current credit (if prepaid model)
  4. "Help": FAQ link, Support contact

#### Ride Request Screen (Step 1: Locations)

- Background: Map placeholder (gray, 60% of screen height on mobile)
- Overlay: Semi-transparent panel at bottom, 40% height, --bg-card
- Sections:
  1. "Pickup location": Input field, rounded 12px, --border-color
     - Button: Current location icon (GPS), right-aligned inside field
  2. "Destination": Input field, same style
     - Recent destinations dropdown (max 4)
  3. "Vehicle type": 3 option cards (Economy, Comfort, Premium)
     - Layout: Horizontal row, each 100px wide, centered
     - Active card: Gold border (2px, --accent-primary), background --bg-card slightly lighter
     - Icon: Vehicle silhouette (32px)
     - Title: 12px, text-light
     - Price (estimated): "From $12.50", 14px, --accent-primary
  4. Action buttons:
     - "Continue": --accent-primary, full width, 48px
     - "Cancel": Outlined style, white border, white text

#### Ride Request Screen (Step 2: Confirm & Payment)

- Card: --bg-card, rounded 16px, full width - 20px padding
- Details section:
  1. Route summary: "Pickup → Destination", 14px
  2. Estimated distance: "2.4 km", 16px, semi-bold
  3. Estimated duration: "8 minutes", 16px, semi-bold
  4. Vehicle & driver preview: "Economy - Driver photo/name" (once matched)
- Pricing breakdown:
  1. Base fare: "$8.00"
  2. Distance charge: "$2.40" (2.4 km × $1/km)
  3. Subtotal: "$10.40", semi-bold
  4. Taxes & fees: "$0.60", 12px, muted
  5. **Total: "$11.00"**, 20px, bold, --accent-primary
- Payment method: Dropdown, "Credit Card ending in 4242"
  - On click: Show payment options (add new card, digital wallet)
- Action buttons:
  1. "Confirm & Pay": --accent-primary, full width, 48px
  2. "Edit details": Outlined, secondary style
- Loading state (while confirming):
  - Button text: "Processing...", disabled, spinner inside
  - Lock icon appears on payment field

#### Live Ride Tracking

- Layout: Map 70%, ride details panel 30% (mobile: map 60%, panel 40%)
- Map placeholder: Show pickup (green pin), destination (red pin), driver location (blue marker)
  - Animate driver marker every 2 seconds with new simulated position
  - Draw route line between pickup and destination (light gold, 2px)
- Ride details panel (--bg-card):
  1. Header: "Your driver is on the way", 16px semi-bold
  2. Driver card:
     - Photo: 48x48px, rounded-full
     - Name: 16px, semi-bold
     - Rating: "4.9 ★", 14px, --accent-primary
     - Vehicle: "Toyota Prius, CA 123ABC", 12px, muted
  3. Status updates (live):
     - "Driver accepted 30 seconds ago", 12px, timestamp
     - "Driver is 2.4 km away", update every 2 seconds
     - Countdown: "Estimated arrival: 8 minutes", 14px
  4. Action buttons:
     - "Call driver": 44px, phone icon, white background
     - "Share status": 44px, share icon, white background
     - "Cancel ride": Text button, red color, 14px
  5. SOS button: Red, rounded-full, "Emergency", sticky at bottom of panel

#### Ride Completion

- Confirmation screen: "You've arrived!", 32px, centered
- Summary card (--bg-card):
  1. Trip summary: Start → End, duration, distance
  2. Final cost breakdown (same as confirmation)
  3. Payment status: "✓ Paid successfully"
  4. Receipt: Collapsible, shows itemized details
  5. Buttons:
     - "Rate your ride": Stars (1-5), comment box (optional)
     - "Share feedback": Text input, 200 char max
     - "Done": Primary button, closes screen, return to dashboard

---

### 2.4 Driver Experience (Chalo Brand Theme)

#### Driver Dashboard

- Top bar: Driver name, vehicle type, "Account" link, "Sign out"
- Main sections:
  1. Status toggle: "Go online" (large button, 56px, --accent-primary) or "You're offline" (gray)
  2. Availability info:
     - Current location: "San Francisco, CA" (GPS updated)
     - Status: "Ready to accept rides" or "Offline"
     - Tonight's earnings: "$42.50", 20px, semi-bold
  3. Ride requests (real-time, when online):
     - Notification card (slides in from top):
       - Pickup location: "123 Main St", 16px
       - Destination: "456 Market St", 16px
       - Estimated fare: "$12.50", 18px, --accent-primary
       - Distance: "0.8 km away", 12px
       - Time remaining: "30 seconds", red countdown
       - Accept/Decline buttons: "Accept" (--accent-primary, 48px), "Decline" (gray, 48px)
  4. Active rides (current):
     - Card: Driver is en route or on ride
     - Content: Pickup address, customer name, time elapsed, "End ride" button
  5. Completed rides: Horizontal scroll
     - Show last 5 rides with earnings, date, time

#### Driver Ride Acceptance

- Notification appears (system plays sound if enabled)
- Modal popup (semi-transparent overlay):
  - Ride details:
    1. "Pickup: 123 Main St, Apt 4B", 16px
    2. Estimated distance: "1.2 km", 14px, semi-bold
    3. Estimated fare: "$15.50", 18px, --accent-primary
    4. Pickup → Destination route preview: Mini map (400x200px)
    5. Customer info: Name, rating (if returning customer)
  - Buttons:
    - "Accept ride": --accent-primary, 56px, bold
    - "Decline": Gray, outlined, "I'm busy"

#### Driver Live Tracking (Ride In Progress)

- Layout: Map 60%, ride panel 40%
- Map: Show customer location (blue pin), driver location (gold marker), destination (red pin)
  - Driver marker updates in real-time (simulated movement)
  - Draw route to pickup, then route to destination
  - Distance to pickup: "0.8 km", top-right corner, semi-bold
- Ride panel (--bg-card):
  1. Customer info: Photo, name, rating, pickup & destination
  2. Status:
     - "En route to pickup", 14px, uppercase, --accent-primary
     - "Estimated pickup in 4 minutes"
  3. Customer message (if they leave note): "Please come to side entrance", 12px, italic
  4. Action buttons:
     - "I've arrived": 48px, primary, changes to "Waiting for customer (2 min)" after click
     - "Call customer": 44px, phone icon
     - "Message": 44px, chat icon
     - "Cancel ride": Text link, red, 12px

#### Driver Completion

- "Ride completed!", 28px
- Summary:
  1. Pickup → Destination
  2. Duration, distance, final fare
  3. Earnings: "+ $15.50", 20px, green (#4caf50)
  4. Button: "Back to dashboard"
- If payment hold is successful:
  - "Payment captured successfully"
  - Driver's available balance updates (shown on dashboard)

#### Driver Wallet & Payouts

- Section: "Available balance: $127.50", 24px, semi-bold, --accent-primary
- Withdrawal options:
  - Minimum: $10
  - Input: Amount to withdraw, max is available balance
  - Button: "Request withdrawal", --accent-primary
- Recent transactions: List with date, amount, status (Completed, Pending)
- Payout method: "Bank account ending in 1234", edit button

---

## Part 3: State Management & Real-Time Features

### Navigation Flow Map

**Guest → Customer Login → Dashboard → Book Ride → Live Tracking → Completion**

**Guest → Driver Login → Driver Dashboard → Accept Ride → Live Tracking → Completion**

### Real-Time Animations & Updates

1. **Driver marker on map**: Simulated movement, update every 2 seconds (40-50px per update for smooth appearance)
2. **Countdown timer**: "30 seconds to decide", red background, decreases every 1 second
3. **Status updates**: Toast notifications slide in/out, auto-dismiss after 4 seconds
4. **Form validation**: On blur, check input validity; on invalid, show error message and shake animation
5. **Loading states**: Button text → "Loading...", spinner, disabled until response
6. **Pulse animations**: CTA buttons have subtle glow (0.5s cycle) to draw attention

### WebSocket / Real-Time Considerations

- Driver location updates: Every 2 seconds (simulated)
- Ride status changes: Immediate notification
- Accept/decline responses: 30-second countdown, auto-cancel if no response
- Payment processing: Real-time feedback (processing → success/error)

---

## Part 4: Mobile Responsiveness (Primary Design)

### Breakpoints

- Mobile: < 640px (default)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-Specific Adjustments

- Hero headline: 48px (from 72px)
- Buttons: Full width - 20px, min 44px height (touch-friendly)
- Cards: Stack vertically, 100% width - 16px padding
- Forms: Single column, 100% width
- Map: Full screen on ride tracking, panel overlays bottom 40%
- Navigation: Bottom tab bar (Home, Ride, Account, Help) on mobile
  - Icons + labels, sticky at bottom, 56px total height

### Tablet & Desktop

- Hero headline: 72px
- Sidebar navigation (optional for desktop dashboard)
- Multi-column layouts for grids
- Map + panel side-by-side (60/40 split)
- Cards in 2-column grids where applicable

---

## Part 5: Implementation Checklist

### Frontend (React/Vue/Svelte)

**Core Pages:**

- [ ] Landing page (all sections: nav, hero, scroll, preview, testimonials, FAQ, CTA, footer)
- [ ] Customer login/signup
- [ ] Driver login/signup
- [ ] Customer dashboard (home, recent rides)
- [ ] Ride booking (step 1: locations, step 2: confirm)
- [ ] Live ride tracking (customer view)
- [ ] Ride completion & rating
- [ ] Driver dashboard (status, earnings)
- [ ] Driver ride acceptance modal
- [ ] Driver live tracking
- [ ] Driver wallet & payouts

**Components:**

- [ ] Navigation bar (fixed, pill-shaped)
- [ ] Buttons (primary, secondary, outlined, loading states)
- [ ] Form inputs (text, email, tel, password, selects)
- [ ] Cards (ride, testimonial, phone preview)
- [ ] Modals (ride acceptance, alerts)
- [ ] Toasts (notifications)
- [ ] Accordion (FAQ)
- [ ] Map placeholder (or integrate Mapbox/Google Maps)
- [ ] Loading spinner
- [ ] Countdown timer
- [ ] Status badge (online/offline, ride status)

**Features:**

- [ ] User authentication (login/signup flows)
- [ ] Role-based views (customer vs. driver)
- [ ] Form validation (real-time, on submit)
- [ ] Real-time notifications (toast messages)
- [ ] Simulated location updates (driver marker movement)
- [ ] Simulated payment processing (with success/error states)
- [ ] Countdown timer (30 seconds to accept)
- [ ] Ride history (list, search, filter by date)
- [ ] Rating system (1-5 stars + comment)
- [ ] Responsive design (mobile-first)

### Styling & Visual Polish

- [ ] Apply grain texture overlay (global, 35% opacity, SVG feTurbulence)
- [ ] Implement soft shadows across cards and buttons
- [ ] Add floating blob animations to landing page
- [ ] Implement reveal-on-scroll animations (staggered)
- [ ] Button hover/active states (scale, shadow, color)
- [ ] Form input focus states (gold ring, --border-color)
- [ ] Loading spinners on buttons
- [ ] Smooth transitions (200ms ease-out default)
- [ ] Toast slide-in animations
- [ ] Modal fade-in transitions

### Performance & Accessibility

- [ ] Semantic HTML structure
- [ ] ARIA labels on interactive elements (buttons, inputs, icons)
- [ ] Color contrast (text on backgrounds meets WCAG AA)
- [ ] Focus management (keyboard navigation)
- [ ] Mobile touch targets (min 44px)
- [ ] Lazy loading for images
- [ ] Optimized animations (60fps, hardware accelerated)

---

## Part 6: Design Token CSS

```css
:root {
  /* Landing Page ("Softly") */
  --softly-bg: #fdfcf8;
  --softly-sage: #e8efe8;
  --softly-lavender: #efedf4;
  --softly-coral: #ffb7b2;
  --softly-text-dark: #292524;
  --softly-text-muted: #78716c;
  --softly-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);

  /* App ("Chalo" Brand) */
  --bg-main: #6f1b1b;
  --bg-card: #9a2121;
  --accent-primary: #d4b454;
  --accent-hover: #b45f06;
  --border-color: #c8833b;
  --text-light: #ffffff;
  --text-dark: #2a2a2a;
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --neutral-bg: #f5f5f5;

  /* Typography */
  --font-primary: "Outfit", sans-serif;
  --font-accent: "Reenie Beanie", cursive;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 28px;
  --font-size-4xl: 32px;
  --font-size-5xl: 36px;
  --font-size-6xl: 48px;
  --font-size-hero: 72px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

## Part 7: Key Interaction Patterns

### Loading States

- Buttons: Text hidden, spinner (16px) centered, opacity 0.6, disabled pointer-events
- Forms: Submit button loading → "Processing...", field inputs disabled
- Maps: Skeleton loading (light gray), gradual image reveal

### Error Handling

- Form validation: Red (#f44336) error text below field, shake animation
- Network errors: Toast notification, "Something went wrong. Try again." button
- Payment failed: Modal alert, "Payment could not be processed. Check your card and try again."

### Success Feedback

- Successful login: Redirect to dashboard, success toast (optional)
- Ride confirmed: Toast "Ride confirmed! Waiting for driver."
- Ride completed: Modal with summary and option to rate
- Withdrawal requested: Toast "Withdrawal requested. Check your bank account in 1-2 business days."

### Empty States

- No recent rides: "No rides yet. Book your first ride!" icon + button
- No saved cards: "Add a payment method to get started." + button
- No wallet transactions: "Your wallet is empty. Add funds to book a ride."

---

## Part 8: Optional Enhancements

1. **Dark mode toggle**: Swap landing page pastels for dark variants
2. **Notification preferences**: Push, SMS, email toggle in settings
3. **Driver ratings system**: Customer rates driver after completion, avg shown on dashboard
4. **Referral program**: "Invite friends, get $5 credits" card
5. **In-app chat**: Simple messaging between customer and driver during ride
6. **Trip replay**: View the ride route replayed on map (post-completion)
7. **Accessibility**: Voice guidance for visually impaired users, high-contrast mode
8. **Internationalization**: Multi-language support (English, Spanish, etc.)

---

## Summary

This specification provides a complete design blueprint for Chalo's MVP. The hybrid approach combines the warm, minimalist "Softly" aesthetic for the landing page with the trust-building burgundy/gold Chalo brand theme for the app experience. All screens, interactions, animations, and components are documented for implementation in your IDE.

Start with the landing page to establish the brand feel, then implement the authentication flows, followed by the core customer and driver experiences. Use the provided CSS tokens for consistent styling across all pages.
