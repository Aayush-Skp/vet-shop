# Curavet - Project Structure & Architecture

## Overview

Curavet is a **hybrid static + dynamic** veterinary clinic website built on **Next.js 16**. The public-facing site (homepage, products page) is plain HTML/CSS/JS served as static files, while the admin CMS is a React/Next.js application. They connect via Next.js API routes that interact with **Firebase Firestore** (database) and **Cloudinary** (image hosting).

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|------------------------------------------------|
| Frontend     | HTML, CSS, Vanilla JS (public site), React (admin) |
| Backend      | Next.js 16 API Routes (server-side)            |
| Database     | Firebase Firestore                              |
| Auth         | Firebase Authentication (email/password)        |
| Image CDN    | Cloudinary                                      |
| Styling      | Custom CSS design system + Tailwind CSS (admin) |
| Deployment   | Vercel                                          |

---

## Directory Structure

```
curavet/
├── app/                            # Next.js App Router (backend + admin UI)
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── globals.css                 # Tailwind imports, global styles
│   │
│   ├── api/                        # ── API Routes (Backend) ──
│   │   ├── products/
│   │   │   └── route.ts            # GET → Fetch all products from Firestore
│   │   ├── bookings/
│   │   │   └── route.ts            # GET → Fetch bookings | POST → Create booking
│   │   ├── upload/
│   │   │   └── route.ts            # POST → Upload product image to Cloudinary
│   │   └── featured-images/
│   │       └── route.ts            # GET/POST/DELETE → Hero image management
│   │
│   └── admin/                      # ── Admin Panel (React) ──
│       ├── page.tsx                # Login page (Firebase Auth)
│       └── dashboard/
│           ├── page.tsx            # Main dashboard orchestrator
│           ├── types.ts            # Shared TypeScript interfaces
│           ├── constants.ts        # Categories, default form values
│           ├── hooks/              # Custom React hooks (business logic)
│           │   ├── useToast.ts     # Toast notification state
│           │   ├── useProducts.ts  # Products CRUD, search, form handling
│           │   ├── useBookings.ts  # Bookings CRUD, search, toggle status
│           │   └── useFeaturedImages.ts # Hero images upload, delete
│           └── components/         # Presentational React components
│               ├── DashboardHeader.tsx   # Top bar with logo + logout
│               ├── TabNavigation.tsx     # Products/Bookings/Hero Images tabs
│               ├── ProductsTab.tsx       # Product list table with search
│               ├── BookingsTab.tsx       # Booking cards with search
│               ├── FeaturedImagesTab.tsx # Hero image upload + grid
│               ├── ProductFormModal.tsx  # Add/edit product form
│               ├── ProductDetailModal.tsx # Product detail view
│               ├── ConfirmDeleteModal.tsx # Reusable delete confirmation
│               └── Toast.tsx            # Toast notification display
│
├── lib/                            # ── Shared Libraries ──
│   ├── firebase.ts                 # Firebase app init + Firestore export (db)
│   ├── firebase-auth.ts            # Firebase Auth export (auth) — browser only
│   ├── cloudinary.ts               # Cloudinary SDK config — server only
│   └── cloudinary-upload.ts        # Shared upload/delete helpers for API routes
│
├── public/                         # ── Static Frontend (MVC Pattern) ──
│   ├── index.html                  # Homepage
│   ├── products.html               # Products listing page
│   │
│   ├── css/                        # ── Modular CSS Design System ──
│   │   ├── styles.css              # Entry point (@import aggregator)
│   │   ├── base.css                # Tokens, reset, typography, layout, buttons
│   │   └── components/
│   │       ├── navbar.css          # Fixed navigation bar
│   │       ├── hero.css            # Hero section + slider + floating cards
│   │       ├── why-choose-us.css   # Why Choose Us card grid
│   │       ├── services.css        # Services section
│   │       ├── products.css        # Product carousel + products page
│   │       ├── about.css           # About section
│   │       ├── testimonials.css    # Testimonial cards
│   │       ├── footer.css          # CTA section + footer
│   │       ├── booking-modal.css   # Booking form modal + form inputs
│   │       └── toast.css           # Toast notifications
│   │
│   ├── controllers/                # ── JS Controllers (Business Logic) ──
│   │   ├── home.controller.js            # Renders homepage sections from models
│   │   ├── products.controller.js        # Product carousel on homepage
│   │   ├── products-page.controller.js   # Products page search/filter
│   │   ├── booking.controller.js         # Booking form modal + submission
│   │   └── ui.controller.js              # Smooth scroll, mobile menu, animations
│   │
│   ├── models/                     # ── JS Models (Data) ──
│   │   ├── clinic.model.js               # Clinic info (name, address, hours)
│   │   ├── navigation.model.js           # Navbar links
│   │   ├── services.model.js             # Services list
│   │   ├── testimonials.model.js         # Customer reviews
│   │   ├── why-choose-us.model.js        # Why Choose Us items
│   │   ├── products.model.js             # Fetches products from /api/products
│   │   └── hero-images.json              # Fallback hero slider images
│   │
│   ├── views/components/           # ── HTML Templates ──
│   │   ├── Navbar.html
│   │   ├── Hero.html
│   │   ├── Services.html
│   │   ├── WhyChooseUs.html
│   │   ├── Testimonials.html
│   │   ├── CallToAction.html
│   │   └── Footer.html
│   │
│   ├── js/                         # ── JS Utilities ──
│   │   ├── hero-slider.js                # Hero image slider (fetches from API)
│   │   └── icons.js                      # SVG icon definitions
│   │
│   ├── data/
│   │   └── products.json                 # Seed/fallback product data
│   │
│   └── assets/
│       ├── logo.png                      # Clinic logo
│       └── images/                       # Local images directory
│
├── next.config.ts              # Rewrites, redirects, Cloudinary domains
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── .env.local                  # Environment variables (not committed)
├── ADMIN_SETUP.md              # Admin setup instructions
└── PROJECT_STRUCTURE.md        # This file
```

---

## How It All Connects

### 1. Public Website Flow

```
Browser visits /
  → next.config.ts rewrite → serves public/index.html
  → index.html loads /css/styles.css (imports base.css + all component CSS)
  → index.html loads JS controllers + models
  → home.controller.js reads models (clinic, services, etc.)
  → home.controller.js renders data into HTML templates
  → products.controller.js fetches /api/products → Firestore
  → hero-slider.js fetches /api/featured-images → Firestore
  → Products + hero images display dynamically
```

**Key point:** The homepage is a static HTML file. JavaScript controllers fetch dynamic data from API routes at runtime.

### 2. Admin Panel Flow

```
Browser visits /admin
  → Next.js renders app/admin/page.tsx (React login form)
  → User logs in via Firebase Auth (email/password)
  → Redirects to /admin/dashboard
  → page.tsx orchestrates hooks (useProducts, useBookings, useFeaturedImages)
  → Hooks fetch data from Firestore via client SDK
  → Tab components render the UI
  → Image uploads: browser → /api/upload (Cloudinary) → returns URL
  → Product/booking data: browser → Firestore directly (client SDK)
```

**Key point:** The admin uses Firebase client SDK in the browser for Firestore writes (authenticated), and API routes only for Cloudinary uploads (needs server-side API secret).

### 3. Booking Flow

```
Homepage → "Book a Visit" button
  → booking.controller.js opens modal form
  → User fills form → client-side validation
  → Modal closes immediately
  → POST /api/bookings → saves to Firestore
  → Toast notification shows success/failure
  → Admin sees booking in dashboard → can confirm/delete
```

### 4. Hero Image Flow

```
Admin uploads image:
  → Browser sends file to POST /api/featured-images
  → Server uses cloudinary-upload.ts helper to upload to Cloudinary
  → API returns Cloudinary URL
  → useFeaturedImages hook writes URL + metadata to Firestore (client SDK)

Homepage loads:
  → hero-slider.js loads fallback images from hero-images.json immediately
  → Fetches /api/featured-images in background
  → If dynamic images exist, preloads them, then swaps into slider
```

---

## File Responsibilities

### Backend (Server-side, runs on Node.js)

| File | Purpose |
|------|---------|
| `app/api/products/route.ts` | Public product listing endpoint |
| `app/api/bookings/route.ts` | Booking creation + admin listing |
| `app/api/upload/route.ts` | Cloudinary image upload (products) |
| `app/api/featured-images/route.ts` | Hero image Cloudinary upload + listing |
| `lib/firebase.ts` | Firebase app + Firestore initialization |
| `lib/cloudinary.ts` | Cloudinary SDK configuration |
| `lib/cloudinary-upload.ts` | Shared upload/delete helper (used by API routes) |
| `next.config.ts` | URL rewrites, redirects, image domains |

### Frontend — Public Site (Static HTML + Vanilla JS)

| File | Purpose |
|------|---------|
| `public/index.html` | Homepage structure (hero, services, products, booking modal) |
| `public/products.html` | Products page structure |
| `public/css/styles.css` | CSS entry point (imports all modular files) |
| `public/css/base.css` | Design tokens, reset, typography, layout, buttons |
| `public/css/components/*.css` | Individual component styles (10 files) |
| `public/controllers/*.js` | Business logic — fetch data, render UI, handle interactions |
| `public/models/*.js` | Data layer — static clinic data + API-fetched products |
| `public/views/components/*.html` | Reusable HTML templates |
| `public/js/hero-slider.js` | Hero carousel with dynamic image loading |

### Frontend — Admin Panel (React/Next.js)

| File | Purpose |
|------|---------|
| `app/admin/page.tsx` | Login form with Firebase Auth |
| `app/admin/dashboard/page.tsx` | Dashboard orchestrator (connects hooks to components) |
| `app/admin/dashboard/types.ts` | Shared TypeScript interfaces (Product, Booking, etc.) |
| `app/admin/dashboard/constants.ts` | Categories array, default form values |
| `app/admin/dashboard/hooks/*.ts` | Business logic hooks (4 files) |
| `app/admin/dashboard/components/*.tsx` | UI components (9 files) |

### Configuration

| File | Purpose |
|------|---------|
| `.env.local` | All API keys (Firebase, Cloudinary) |
| `next.config.ts` | Route rewrites: `/` → `index.html`, `/products` → `products.html` |
| `package.json` | Dependencies, build scripts |
| `tsconfig.json` | TypeScript paths, compiler options |

---

## CSS Architecture

### Public Site — Modular CSS Design System

The CSS is split into a **base layer** and **component files** for maintainability:

```
styles.css          ← Entry point, imports everything via @import
  ├── base.css      ← Design tokens (colors, fonts, spacing), reset, typography,
  │                    layout (.container, .section), buttons (.btn--*),
  │                    utilities (.sr-only), animations, reduced-motion
  │
  └── components/
      ├── navbar.css         ← Fixed nav, mobile menu, scroll state
      ├── hero.css           ← Full-bleed hero, slider, floating cards, decorations
      ├── why-choose-us.css  ← 5-column card grid
      ├── services.css       ← Service cards with border-left accent
      ├── products.css       ← Horizontal carousel + /products page grid
      ├── about.css          ← About section
      ├── testimonials.css   ← 3-column testimonial cards
      ├── footer.css         ← CTA gradient section + footer grid
      ├── booking-modal.css  ← Booking form modal with all input styles
      └── toast.css          ← Bottom-right toast notifications
```

- Color palette: Teal (`#0D9488`) + warm neutrals
- Typography: Plus Jakarta Sans (headings) + DM Sans (body)
- Responsive breakpoints: 480px, 576px, 768px, 992px, 1100px

### Admin Panel — Tailwind CSS

- Used via `app/globals.css` → `@import "tailwindcss"`
- Utility-first classes in `app/admin/*.tsx` components
- Teal-600/700 as primary admin color

---

## Admin Dashboard Architecture

The dashboard follows a **hooks + components** pattern for separation of concerns:

```
page.tsx (Orchestrator)
  │
  ├── Hooks (Business Logic)
  │   ├── useToast()          → Toast state management
  │   ├── useProducts()       → Products CRUD, form, validation, search
  │   ├── useBookings()       → Bookings CRUD, toggle status, search
  │   └── useFeaturedImages() → Hero images upload, delete, fetch
  │
  └── Components (UI)
      ├── DashboardHeader     → Logo, user email, logout
      ├── TabNavigation       → Products / Bookings / Hero Images tabs
      ├── ProductsTab         → Product table with search
      ├── BookingsTab         → Booking cards with status badges
      ├── FeaturedImagesTab   → Upload form + image grid
      ├── ProductFormModal    → Add/edit product form
      ├── ProductDetailModal  → Product detail view
      ├── ConfirmDeleteModal  → Reusable delete confirmation (generic)
      └── Toast               → Toast notification display
```

**Benefits:**
- Each hook manages its own state and API calls
- Components are pure presentational (receive data via props)
- The `ConfirmDeleteModal` is reusable across all three entity types
- Adding a new tab/feature = add one hook + one component

---

## Firebase Collections

| Collection | Purpose | Access |
|------------|---------|--------|
| `products` | Product catalog (name, price, image, category...) | Public read, auth write |
| `bookings` | Customer booking requests | Public create, auth read/write/delete |
| `featured_images` | Hero slider images (URL, alt, order) | Public read, auth write |

---

## Environment Variables

```env
# Firebase Client SDK (NEXT_PUBLIC_ = available in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Cloudinary (server-side only, no NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Key Design Decisions

1. **Hybrid architecture** — Static HTML for speed (public site) + React for interactivity (admin). The public site loads instantly as HTML, then hydrates with dynamic data.

2. **Client-side Firestore writes** — The admin dashboard writes to Firestore directly from the browser (where Firebase Auth session exists), not through API routes. This is because Firestore security rules require `request.auth != null`, which only works with the client SDK in an authenticated browser session.

3. **Server-side Cloudinary only** — Image uploads go through API routes because the Cloudinary API secret must never be exposed to the browser. The shared `cloudinary-upload.ts` helper eliminates code duplication between the product upload and hero image upload routes.

4. **Fallback-first hero images** — The hero slider shows local fallback images instantly, then swaps in Firestore-managed images after they're fetched and preloaded. This prevents any blank/loading state.

5. **Hooks + Components separation** — The admin dashboard separates business logic (hooks) from UI (components). Each domain (products, bookings, featured images) has its own hook, making the codebase easy to maintain and extend.

6. **Modular CSS** — The public site CSS is split into a base layer (tokens, reset, buttons) and per-component files. `styles.css` acts as an aggregator via `@import`. This makes it easy to find and modify styles for any specific section.

7. **No `app/page.tsx`** — The root page is intentionally absent. The `next.config.ts` rewrite rule maps `/` → `/index.html`, which serves the static homepage from `public/`. Having both would cause a conflict.
