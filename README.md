# MENSWARE

### Premium Men's E-Commerce • Full-Stack JavaScript

> A dark, premium storefront with a connected Express + MongoDB commerce backend.

## Architecture

```text
Browser
  ├── /              → index.html
  ├── /checkout      → checkout.html
  └── /api/*         → Express → MongoDB
```

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| UI | HTML5 + CSS3 | Lightweight responsive storefront |
| Interaction | Vanilla JavaScript | Fast, dependency-light browser layer |
| Runtime | Node.js | JavaScript across the stack |
| API | Express.js | Modular REST architecture |
| Data | MongoDB + Mongoose | Flexible commerce documents + validation |
| Auth | JWT + bcryptjs | Secure sessions + password hashing |
| Security | Helmet + CORS + rate limiting | API hardening |
| Deployment | Vercel-ready | API + static storefront deployment |

## Connected Features

- Product catalog, search, categories and product detail API
- Guest cart using secure session cookie
- Authenticated cart tied to the user account
- Registration, login, `/me` and logout
- Product/admin CRUD routes
- Server-side order pricing and stock validation
- Customer order history and protected order lookup
- Admin order listing and status management
- Checkout connected directly to cart + order APIs
- `/api/health` database health check
- Same-origin API configuration for production deployment

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
├── server.js
├── package.json
├── vercel.json
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Order.js
│   └── OTP.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
└── routes/
    ├── authRoutes.js
    ├── productRoutes.js
    ├── cartRoutes.js
    └── orderRoutes.js
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

## Deployment

The repository is configured for Vercel with an Express serverless runtime plus static HTML/media builds. Production requires `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` environment variables. The database connection is lazy and reusable for serverless requests.

Vercel's current Express guidance recommends serving static assets through its static layer rather than relying on `express.static()`. citeturn2search1turn2search0

## Verification Status

**Integration:** completed — storefront → auth → products → cart → checkout → orders are connected.

**Repository:** pushed to `main`.

**Live production:** not marked as verified because this ChatGPT workspace has no existing Vercel project connected to MENSWARE, and no production environment variables are available. The repository is deployment-ready; after importing it into Vercel, smoke-test `/`, `/checkout`, and `/api/health` first.

## Author

**Harsh Dubey** · GitHub: https://github.com/chillingbing648-sketch
