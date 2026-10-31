# Olive & Ember Kitchen | Premium Full-Stack Restaurant Platform

An artisanal, commercial-ready restaurant website, ordering platform, reservation system, and back-of-house management portal. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🌟 Executive Highlights

- **Aesthetic Visual Identity**: Art-directed editorial palette of warm ivory (`#FAF8F5`), rich hearth charcoal (`#1C1917`), muted olive (`#5B6E38`), and warm terracotta accents (`#C25E3E`), with responsive mobile navigation and typography.
- **Interactive Digital Menu**: Real-time course filtering, dietary badges (Vegetarian, Vegan, Gluten-Free), allergen tags, preparation estimates, ingredient search, and dish customization modal.
- **Deterministic Server-Side Pricing Engine**: Hardened protection against client tampering. Subtotals, tiered promotional coupons (`EMBER10`, `WELCOME100`), 5% GST tax calculation, and free delivery thresholds are calculated on the server.
- **Table Reservation System**: Multi-step booking engine enforcing party limits (1–12 guests), opening hours, advance horizons, and concurrent table conflict checks. Emits unique references (`RES-XXXX`).
- **Complete Online Food Ordering**: Seamless checkout for Takeaway Pickup, Delivery (with address validation), and Dine-In direct table ordering. Generates unguessable tracking links (`/order-tracking/OE-XXXXXX`).
- **Table QR Digital Menu Generator**: Generates high-resolution QR codes with customizable table identifiers, downloadable PNG assets, and print-ready table tent cards.
- **Back of House (BOH) Admin Operations**: Role-based access control (`OWNER`, `ADMIN`, `STAFF`) with operational overview KPIs, live order tickets, reservation manager with booth assignment, menu item CRUD, promotional coupon builder, and audit activity logs.
- **Flexible Dual Database Architecture**: Zero-config SQLite database (`prisma/schema.prisma`) for local standalone testing and demonstration without Docker/Postgres; pre-configured PostgreSQL schema (`prisma/schema.postgresql.prisma`) for production deployment (Supabase, Neon, AWS RDS, Railway).
- **Payment & Notification Adaptability**: Seamless Indian payment processing via Razorpay (including test mode signature verification) and transactional notification dispatcher (Email & WhatsApp Cloud API).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm**: v9+

### 2. Installation
```bash
# Clone or navigate to the repository directory
cd resume

# Install dependencies
npm install
```

### 3. Database Initialization & Seeding
```bash
# Push Prisma schema to local database
npx prisma db push

# Populate with realistic Olive & Ember sample dishes, categories, orders, and reservations
node seed.mjs
```

### 4. Run Development Server
```bash
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Administrative Demo Credentials

To access the back-of-house operations portal at **[http://localhost:3000/admin](http://localhost:3000/admin)**:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Owner / Head Chef** | `admin@oliveandember.demo` | `AdminPass@2026` | Full system access, settings, menu CRUD, logs, coupons |
| **Floor Staff** | `staff@oliveandember.demo` | `StaffPass@2026` | Order ticket status, reservation seating, view-only settings |

*Quick-fill buttons are provided on the login page for convenience.*

---

## 📁 Project Architecture & Directory Layout

```
resume/
├── .env.example                     # Environment configuration template
├── README.md                        # Project documentation
├── package.json
├── tsconfig.json
├── tailwind.config.ts               # Custom warm ivory / terracotta / olive theme
├── next.config.mjs
├── prisma/
│   ├── schema.prisma                # SQLite dev schema
│   ├── schema.postgresql.prisma     # PostgreSQL production schema
│   └── dev.db                       # Active local database
├── seed.mjs                         # Idempotent demo database generator
├── tests/
│   ├── pricing.test.ts              # Unit tests for server pricing calculations
│   └── razorpay.test.ts             # Unit tests for payment HMAC signatures
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout & Playfair/Inter font loading
│   │   ├── page.tsx                 # Customer-facing Homepage
│   │   ├── about/page.tsx           # Story & Culinary Craft
│   │   ├── menu/page.tsx            # Digital Menu & Customization
│   │   ├── reservations/page.tsx    # Table Booking Interface
│   │   ├── checkout/page.tsx        # Fulfilment & Payment Checkout
│   │   ├── order-tracking/[code]/   # Live Kitchen Progress Tracker
│   │   ├── gallery/page.tsx         # Ambience & Cuisine Photo Gallery
│   │   ├── offers/page.tsx          # Coupons & Promotions Showcase
│   │   ├── contact/page.tsx         # Location, Hours, Maps Link & Contact Form
│   │   ├── faq/page.tsx             # Frequently Asked Questions
│   │   ├── privacy/page.tsx         # Privacy Policy
│   │   ├── terms/page.tsx           # Terms & Cancellation Policy
│   │   ├── sitemap.ts & robots.ts   # SEO Metadata
│   │   ├── admin/                   # BOH Operations
│   │   │   ├── layout.tsx           # Authenticated Sidebar Layout
│   │   │   ├── login/page.tsx       # Staff Authentication Portal
│   │   │   ├── page.tsx             # Overview KPI Metrics
│   │   │   ├── orders/page.tsx      # Live Order Ticket Manager
│   │   │   ├── reservations/        # Table Booking Approval & Seating
│   │   │   ├── menu/page.tsx        # Menu CRUD, Stock Toggles, Prices
│   │   │   ├── qr-menu/page.tsx     # Table QR Generator & Printable Tents
│   │   │   ├── promotions/page.tsx  # Coupon Builder & Usage Caps
│   │   │   ├── analytics/page.tsx   # Financial Ledger & Popular Dishes
│   │   │   ├── settings/page.tsx    # Taxes, Delivery Radius, Hours
│   │   │   └── activity-logs/       # Chronological Audit Trails
│   │   └── api/                     # Server-Side Route Handlers
│   │       ├── auth/login & logout  # JWT session cookie handlers
│   │       ├── orders/create        # Transactional order creation
│   │       ├── orders/status        # Order progress & signature check
│   │       ├── reservations/create  # Table availability check & creation
│   │       ├── pricing/calculate    # Deterministic pricing preview
│   │       ├── contact/             # Contact inquiry submission
│   │       ├── qr/generate          # Dynamic QR SVG/PNG generator
│   │       └── admin/*              # Protected administrative APIs
│   ├── components/
│   │   ├── layout/                  # Navbar, Footer, Shell
│   │   ├── cart/                    # Cart Drawer & Fulfilment Selector
│   │   ├── menu/                    # Interactive Menu Client
│   │   ├── reservations/            # Reservation Booking Form
│   │   └── admin/                   # BOH Management Clients
│   ├── lib/
│   │   ├── db.ts                    # Prisma singleton
│   │   ├── auth.ts                  # Password hashing & JWT cookies
│   │   ├── pricing.ts               # Subtotal, 5% GST, coupons, delivery fee engine
│   │   ├── availability.ts          # Table slot & cover limit engine
│   │   ├── razorpay.ts              # Razorpay order creator & signature verifier
│   │   ├── notifications.ts         # Email & WhatsApp notification dispatcher
│   │   ├── qr.ts                    # QR code generator helper
│   │   └── utils.ts                 # INR Currency (₹) and Date formatters
│   └── types/                       # Shared TypeScript models
```

---

## 🛠️ Switching to Production PostgreSQL

For production deployment (Vercel, Supabase, Neon, AWS RDS, Railway):

1. **Set your PostgreSQL URI** in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/olive_and_ember?schema=public"
   ```
2. **Swap to the PostgreSQL schema**:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   npx prisma generate
   npx prisma db push
   node seed.mjs
   ```

---

## 💳 Optional Integrations Configuration

### Razorpay (Online Payments)
Add your credentials to `.env`:
```env
RAZORPAY_KEY_ID="rzp_live_your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```
*When left as placeholder or empty, the application runs in documented test sandbox mode.*

### WhatsApp & Email Notifications
```env
NOTIFICATION_PROVIDER="resend" # or 'console'
NOTIFICATION_FROM_EMAIL="reservations@yourrestaurant.com"
RESEND_API_KEY="re_123456789"
WHATSAPP_API_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="1084920..."
```

---

## 🧪 Testing & Production Build

```bash
# Run unit tests
npm test

# Build production bundle
npm run build

# Start production server
npm start
```
