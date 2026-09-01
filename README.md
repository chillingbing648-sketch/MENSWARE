# MENSWARE

### Premium Men's E-Commerce • Full-Stack JavaScript

> A dark, premium storefront with a connected Express + MongoDB commerce backend.

## Architecture

```text
Browser
  │
  ├── /                    → index.html
  ├── /checkout            → checkout.html
  │
  └── /api/*               → Express API
                              ├── Auth
                              ├── Products
                              ├── Cart
                              └── Orders
                                      │
                                      ▼
                                  MongoDB
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
- Checkout page connected directly to cart + order APIs
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

The repository now contains Vercel routing for the Express API and root storefront. Vercel requires the production environment to contain `MONGO_URI`, `JWT_SECRET`, and the appropriate `FRONTEND_URL`. The API establishes its MongoDB connection lazily so serverless requests can reuse the connection.

Vercel's current Express guidance notes that static assets should normally be served through Vercel's static layer rather than relying on `express.static()`, so this repository explicitly builds the storefront HTML and media files alongside the Node function. citeturn2search1turn2search0

## Verification Status

**Code integration:** completed — frontend → auth → products → cart → checkout → orders are connected.

**Repository:** pushed to `main`.

**Runtime deployment:** deployment credentials/project are not currently connected to this ChatGPT workspace, so a live production request cannot honestly be marked as verified here. Once the GitHub repository is imported into Vercel and the three environment variables are supplied, `/`, `/checkout`, and `/api/health` are the first production smoke tests to run.

## Author

**Harsh Dubey** · GitHub: https://github.com/chillingbing648-sketch
