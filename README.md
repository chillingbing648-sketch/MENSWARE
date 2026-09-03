# MENSWARE

### Premium Men's E-Commerce · Full-Stack JavaScript

> A dark, premium storefront backed by an Express + MongoDB commerce API, with a GitHub Pages-compatible static catalog preview.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-111111?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-111111?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-111111?logo=mongodb)](https://www.mongodb.com/)

## Architecture

MENSWARE follows a **thin-route + service-layer** architecture. Business logic is kept out of the HTTP adapters and storefront HTML.

```text
Browser
  │
  ├── index.html ──→ assets/js/app.js ──→ Express API (full-stack)
  │                                      └→ static catalog fallback (GitHub Pages)
  └── checkout.html → assets/js/checkout.js
                         │
                         ▼
                     Express API
                         │
             ┌───────────┴───────────┐
             │                       │
        Middleware                Routes
     auth / errors          HTTP → service calls
                                     │
                                  Services
                     auth / products / cart / orders
                                     │
                                  Mongoose
                                     │
                                  MongoDB
```

See the detailed [architecture guide](docs/ARCHITECTURE.md).

## Core Features

- Product catalog, search, categories and product lookup by ID/slug
- GitHub Pages-compatible static catalog fallback
- Guest cart using a secure HTTP-only session cookie on the full-stack deployment
- Local browser preview cart on GitHub Pages
- Authenticated cart tied to the customer account
- Registration, login, `/me` and logout
- Admin-only product creation, editing and archival
- Server-side order pricing, validation and stock checks
- MongoDB transaction-based variant stock decrement during checkout
- Customer order history and protected order lookup
- Admin order listing and status management
- Connected checkout flow
- Database-aware `/api/health` endpoint
- Helmet, CORS, rate limiting and HTTP-only authentication cookies
- Vercel routing for the API/full-stack deployment

## API

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/products
GET    /api/products/:idOrSlug
POST   /api/products                 # admin
PATCH  /api/products/:id             # admin
DELETE /api/products/:id             # admin
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
POST   /api/orders
GET    /api/orders/my
GET    /api/orders/:id
GET    /api/orders/admin/all         # admin
PATCH  /api/orders/admin/:id/status  # admin
```

## Project Structure

```text
MENSWARE/
├── index.html
├── checkout.html
├── server.js                 # Application composition root
├── config/
│   └── database.js           # MongoDB connection lifecycle
├── assets/
│   ├── data/catalog.json     # Static GitHub Pages catalog fallback
│   └── js/
│       ├── app.js            # Storefront client + API/static fallback
│       └── checkout.js       # Checkout client + preview handling
├── models/                   # Mongoose schemas
├── services/                 # Business logic
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
├── middleware/               # Auth + centralized errors
├── routes/                   # Thin HTTP adapters
├── tests/                    # Regression tests
├── docs/
│   └── ARCHITECTURE.md
├── vercel.json
└── package.json
```

## Setup

```bash
git clone https://github.com/chillingbing648-sketch/MENSWARE.git
cd MENSWARE
npm install
npm start
```

Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5000
NODE_ENV=development
```

Open `http://localhost:5000`.

## GitHub Pages vs Full-Stack Deployment

GitHub Pages can serve the MENSWARE HTML/CSS/JavaScript but **cannot execute the Express server or connect directly to MongoDB**. The storefront therefore detects `github.io` hosts and loads the committed static catalog instead of repeatedly requesting `/api/products`.

For the complete commerce experience — authentication, database-backed cart, checkout and orders — deploy the Express application using the supplied `vercel.json` configuration and provide the required environment variables.

## Verification

```bash
npm run check     # JavaScript syntax checks
npm test          # Node regression tests
npm run verify    # both checks together
```

CI runs `npm run verify` on pushes and pull requests targeting `main`.

## Important Commerce Notes

- Prices are recalculated on the server; the browser is not trusted for order totals.
- Variant stock is decremented as part of the order transaction. Production MongoDB should support transactions (for example MongoDB Atlas/replica set deployment).
- The `online` payment method currently represents a payment-processing state; it is **not** a proof of successful payment. A real payment provider/webhook integration is still required before accepting online payments in production.
- `fampay` is currently an allowed order method, not a live payment gateway integration.
- Static GitHub Pages catalog entries are preview inventory and are not synchronized with MongoDB.

## Deployment

`vercel.json` maps `/api/*` to the Express server and serves the HTML/frontend assets through Vercel's static layer. Production requires `MONGO_URI`, `JWT_SECRET` and `FRONTEND_URL` environment variables.

GitHub Pages is suitable for the static storefront preview. The Pages build is triggered automatically from `main` in the repository's configured Pages workflow.

## Security Baseline

- HTTP security headers through Helmet
- CORS allowlist with credentials
- HTTP-only auth cookies
- Password hashing with bcrypt
- JWT authentication and admin authorization
- Global API rate limiting
- JSON/urlencoded payload limits
- Centralized error responses that hide internal errors in production
- Server-side price, stock and order-state validation

## Roadmap

1. Request schemas with Zod/Joi
2. Integration tests with a disposable MongoDB environment
3. Real payment-provider adapter + webhook verification
4. Cart merge when a guest signs in
5. Structured logging and request IDs
6. Stronger admin audit trail and RBAC
7. E2E tests for storefront → cart → checkout → order
8. Production monitoring and deployment smoke tests

## Author

**Harsh Dubey** · [GitHub](https://github.com/chillingbing648-sketch)
