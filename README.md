# MENSWARE

### Premium Men's Accessories E-Commerce · Full-Stack JavaScript

> A premium dark-themed men's accessories storefront with a production-oriented Express + MongoDB commerce API, authenticated customer accounts, cart management, checkout/order workflows, and a GitHub Pages-compatible catalog preview.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-111111?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-111111?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-111111?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Private%20Project-111111)](#)

## Overview

MENSWARE is a full-stack men's accessories commerce application designed around a clean storefront experience and a separated server-side commerce layer.

The application supports two operating modes:

- **Full-stack mode** — Express API + MongoDB for authentication, products, carts and orders.
- **Static preview mode** — GitHub Pages serves the storefront and committed catalog data without requiring a backend.

The backend is intentionally structured so HTTP routes stay thin while business logic lives in dedicated services.

## Product Capabilities

### Storefront

- Product catalog browsing
- Product lookup by ID or slug
- Search and category-oriented catalog navigation
- Dedicated checkout page
- Static catalog fallback for GitHub Pages

### Accounts & Authentication

- Customer registration and login
- Authenticated `/me` session lookup
- Logout
- JWT-based authentication
- HTTP-only authentication cookies
- Admin authorization

### Cart & Orders

- Guest cart support in the full-stack deployment
- Browser-local preview cart on GitHub Pages
- Authenticated customer carts
- Add, update and remove cart items
- Server-side price recalculation
- Server-side stock validation
- Customer order history
- Protected order lookup
- Admin order listing and status management

### Admin Commerce

- Create products
- Edit products
- Archive/delete products
- Manage order status
- Server-controlled pricing and inventory validation

### Reliability & Security

- Database-aware `/api/health` endpoint
- Helmet security headers
- CORS allowlist with credentials
- Global API rate limiting
- HTTP-only cookies
- bcrypt password hashing
- JWT authentication
- Centralized error handling
- Request payload limits
- Server-side order validation

## Architecture

```text
                         Browser
                            │
              ┌─────────────┴─────────────┐
              │                           │
        Storefront UI                Checkout UI
        index.html                    checkout.html
              │                           │
              └─────────────┬─────────────┘
                            │
                    assets/js/*.js
                            │
                 ┌──────────▼──────────┐
                 │    Express API      │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Routes        Middleware      Health API
             │
          Services
      ┌──────┼──────┬──────┐
      │      │      │      │
     Auth  Product  Cart  Order
      │      │      │      │
      └──────┴──────┴──────┘
                │
             Mongoose
                │
             MongoDB
```

The composition root is `server.js`. It mounts the authentication, product, cart and order routes, applies security middleware, serves the frontend and initializes the database connection. fileciteturn5file0L2-L5

## API Surface

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
├── server.js
├── config/
│   └── database.js
├── assets/
│   ├── data/
│   │   └── catalog.json
│   └── js/
│       ├── app.js
│       └── checkout.js
├── models/
├── services/
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
├── middleware/
├── routes/
├── tests/
├── docs/
│   └── ARCHITECTURE.md
├── vercel.json
└── package.json
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js 20+, Express 5 |
| Database | MongoDB + Mongoose 8 |
| Authentication | JWT + HTTP-only cookies + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Configuration | dotenv |
| Testing | Node.js built-in test runner |
| Deployment | Vercel + GitHub Pages preview |

The current package configuration uses Node `>=20`, Express 5, Mongoose 8, JWT, bcryptjs, Helmet, CORS, rate limiting and the Node test runner. fileciteturn4file0L2-L5

## Local Development

### 1. Clone

```bash
git clone https://github.com/chillingbing648-sketch/MENSWARE.git
cd MENSWARE
```

### 2. Install

```bash
npm install
```

### 3. Configure environment variables

Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5000
NODE_ENV=development
```

`JWT_SECRET` is required when starting the server. fileciteturn5file0L2-L5

### 4. Start

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Open `http://localhost:5000`.

## Verification

```bash
npm run check
npm test
npm run verify
```

`check` validates JavaScript syntax for the server and storefront scripts. `test` runs the Node regression suite, while `verify` runs both. fileciteturn4file0L2-L5

## Deployment Model

### Full-stack deployment

Deploy the Express application through the supplied Vercel configuration. Production requires:

```text
MONGO_URI
JWT_SECRET
FRONTEND_URL
```

The server exposes the API under `/api/*` and serves the storefront assets from the same application. fileciteturn5file0L2-L5

### GitHub Pages

GitHub Pages can host the static storefront but cannot run Express or connect directly to MongoDB. MENSWARE therefore uses the committed `assets/data/catalog.json` as a static catalog fallback.

The static preview should be treated as **preview inventory**, not a live database-backed commerce environment.

## Commerce & Payment Notes

- Order totals are recalculated server-side; the browser is never trusted for final pricing.
- Variant stock is validated and decremented through the order transaction workflow.
- Production MongoDB should support transactions, such as a replica-set/Atlas deployment.
- The `online` order method currently represents a payment-processing state; it is **not proof of successful payment**.
- A real payment provider and verified webhook flow are still required before accepting online payments in production.
- `fampay` is currently an allowed order method, not a live payment-gateway integration.
- Static GitHub Pages inventory is not synchronized with MongoDB.

## Engineering Principles

MENSWARE follows a few deliberate principles:

1. **Thin routes** — HTTP adapters should remain small and delegate business logic.
2. **Server authority** — prices, stock and order state are validated on the server.
3. **Secure sessions** — authentication is kept in HTTP-only cookies rather than exposed client-side tokens.
4. **Graceful preview mode** — the storefront remains demonstrable without a backend.
5. **Testable business logic** — services are separated from transport concerns.

## Roadmap

- [ ] Request validation with Zod/Joi
- [ ] Disposable MongoDB integration-test environment
- [ ] Production payment provider + webhook verification
- [ ] Guest-to-account cart merge
- [ ] Structured logging and request IDs
- [ ] Stronger admin RBAC and audit trail
- [ ] End-to-end storefront → cart → checkout → order tests
- [ ] Production monitoring and smoke tests

## Author

**Harsh Dubey** · [GitHub](https://github.com/chillingbing648-sketch)

---

*MENSWARE is a learning/portfolio commerce project focused on full-stack JavaScript engineering, secure commerce workflows and practical deployment architecture.*
