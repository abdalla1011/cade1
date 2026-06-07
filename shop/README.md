# Maison — Next.js E-Commerce

A full-stack e-commerce application built with Next.js 15, Prisma, and Tailwind CSS.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | Custom JWT sessions (bcrypt + HTTP-only cookies) |
| Styling | Tailwind CSS |
| Payments | Stripe (optional — demo mode without keys) |
| Fonts | Playfair Display + DM Sans |

## Features

- **Auth** — Register, login, logout with secure HTTP-only cookie sessions
- **Product catalog** — Browse all products, filter by category, search, sort by price
- **Product detail** — Images, reviews, stock indicator, add-to-cart
- **Cart** — Add, update quantity, remove items; persistent per user
- **Checkout** — Address management, order notes, order placement
- **Orders** — Order history, status tracker (pending → confirmed → shipped → delivered)
- **Database** — Full relational schema: users, products, categories, cart, orders, payments, shipments, reviews

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your values:

```bash
# Already created for you — edit as needed
```

Required:
```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="run: openssl rand -base64 32"
```

Optional (for real Stripe payments):
```
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Set up database

```bash
npm run db:push    # Creates the SQLite database and all tables
npm run db:seed    # Seeds 8 products, 3 categories, 1 demo user
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login:** `demo@shop.com` / `password123`

---

## Project structure

```
shop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Sign in
│   │   └── register/page.tsx       # Create account
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # POST /api/auth/login
│   │   │   ├── register/route.ts   # POST /api/auth/register
│   │   │   └── signout/route.ts    # POST /api/auth/signout
│   │   ├── addresses/route.ts      # GET, POST /api/addresses
│   │   ├── cart/
│   │   │   ├── route.ts            # GET, POST /api/cart
│   │   │   └── [id]/route.ts       # PATCH, DELETE /api/cart/:id
│   │   ├── checkout/route.ts       # POST /api/checkout (Stripe intent)
│   │   ├── orders/
│   │   │   ├── route.ts            # GET, POST /api/orders
│   │   │   └── [id]/route.ts       # GET /api/orders/:id
│   │   └── products/route.ts       # GET /api/products
│   ├── cart/page.tsx               # Cart page
│   ├── checkout/page.tsx           # Checkout page
│   ├── orders/
│   │   ├── page.tsx                # Order history
│   │   └── [id]/page.tsx           # Order detail + status tracker
│   ├── shop/
│   │   ├── page.tsx                # Product listing with filters
│   │   └── [id]/page.tsx           # Product detail
│   ├── error.tsx                   # Error boundary
│   ├── globals.css                 # Tailwind + design tokens
│   ├── layout.tsx                  # Root layout (fonts, navbar, footer)
│   ├── loading.tsx                 # Skeleton loader
│   ├── not-found.tsx               # 404 page
│   └── page.tsx                    # Homepage (hero, categories, featured)
├── components/
│   ├── layout/
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx              # Responsive nav with cart count
│   └── shop/
│       ├── AddToCartButton.tsx     # Client-side add to cart
│       ├── CartActions.tsx         # Quantity +/- and remove
│       └── CheckoutForm.tsx        # Address selection + order placement
├── lib/
│   ├── auth.ts                     # getSession(), requireAuth()
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # formatPrice, calculateOrderTotals, etc.
├── prisma/
│   ├── schema.prisma               # Full data model
│   └── seed.ts                     # Sample data
├── types/
│   └── index.ts                    # TypeScript interfaces
└── ...config files
```

## Switching to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/shop"
   ```
3. Run `npm run db:push`

## Adding real Stripe payments

1. Get keys from [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys)
2. Add to `.env.local`
3. The checkout flow already calls `/api/checkout` to create a PaymentIntent — wire up `@stripe/stripe-js` and `@stripe/react-stripe-js` on the frontend for the card element

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Set env vars in the Vercel dashboard. Use a PostgreSQL provider (Supabase, Neon, PlanetScale) for the database.

---

## Order status flow

```
pending → confirmed → processing → shipped → delivered
                                          ↘ cancelled
```

Orders are created with status `confirmed` in the demo. In production, a webhook from Stripe would confirm payment and advance the status.
