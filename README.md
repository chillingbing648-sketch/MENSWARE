# MENSWARE

### Premium Men's E-Commerce • Full-Stack JavaScript

> A dark, premium storefront backed by a clean Express + MongoDB commerce architecture.

## Architecture

```text
MENSWARE/
├── index.html / checkout.html     # Frontend
├── server.js                      # API bootstrap
├── routes/                        # REST endpoints
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── middleware/                    # Cross-cutting backend logic
│   ├── auth.js
│   └── errorHandler.js
└── models/                        # MongoDB/Mongoose models
    ├── User.js
    ├── Product.js
    ├── Cart.js
    ├── Order.js
    └── OTP.js
```

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| UI | HTML5 + CSS3 | Lightweight, responsive storefront |
| Interaction | Vanilla JavaScript | Minimal dependency overhead |
| Runtime | Node.js | JavaScript across the stack |
| API | Express.js | Modular REST architecture |
| Data | MongoDB + Mongoose | Flexible commerce documents + validation |
| Auth | JWT + bcryptjs | Signed sessions + password hashing |
| Security | Helmet + CORS + rate limiting | API hardening |

## Features

- Premium dark/metallic storefront with responsive product grid
- Product search, categories and featured products
- Product variants, SKUs and stock
- Guest + authenticated carts
- Customer/admin accounts and JWT authentication
- OTP persistence with MongoDB TTL expiry
- Server-side order pricing, tax and shipping calculation
- COD, online and FaMPay payment states
- Admin product and order management
- Centralized API errors + health monitoring

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

## Setup

```bash
git clone https://github.com/chillingbing648-sketch/MENSWARE.git
cd MENSWARE
npm install
```

`.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Run with `npm run dev` or `npm start`.

## Architecture Fixes Applied

- Root-level backend files separated into `models/`, `routes/` and `middleware/`.
- Added the missing `package.json` and dependency definitions.
- Added missing product, cart and authentication routes.
- Renamed the order router to `routes/orderRoutes.js` and aligned imports.
- Renamed the error middleware to `middleware/errorHandler.js` and aligned imports.
- Added `passwordHash` support so the existing JWT middleware has a real login flow.
- Removed the duplicate legacy `ReadMe` file.
- Preserved existing media and storefront files.

## Status

**Development / Full-Stack Prototype** — the codebase is structurally consistent and ready for the next integration/testing pass.

## Author

**Harsh Dubey** · [GitHub](https://github.com/chillingbing648-sketch)
