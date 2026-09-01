# MENSWARE

### Luxury Men's Accessories • Full-Stack E-Commerce Concept

> A dark, premium shopping experience for men's accessories, combining a high-contrast luxury UI with a Node.js/MongoDB commerce backend.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white)](https://mongoosejs.com/)

---

## ✦ Overview

**MENSWARE** is designed as a premium men's-accessories storefront with an emphasis on visual identity, responsive product discovery, and an extensible commerce foundation.

The current repository combines a polished HTML/CSS storefront with backend building blocks for **products, users, authentication, carts, OTP verification, checkout, and order management**. fileciteturn9file0 fileciteturn3file0

### Design Direction
- **Visual language:** dark / metallic luxury
- **Accent:** crimson / deep red
- **Typography:** Orbitron for brand/display elements + Montserrat for readable UI copy
- **Interaction:** hover elevation, glow effects, transitions, modal quick views
- **Layout:** responsive CSS Grid with mobile-first adaptation

---

## ⚡ Core Experience

| Area | What it provides |
|---|---|
| 🛍️ Product Discovery | Responsive product cards, imagery, pricing and search UI |
| 🔎 Search | Client-side search interface for product discovery |
| 👁️ Quick View | Modal-based product preview |
| 🛒 Cart | MongoDB-backed cart model with product variants and quantities |
| 👤 Accounts | Customer/admin user model with role-based access |
| 🔐 Authentication | JWT authentication via cookie or Bearer token |
| 🔢 OTP | Login/admin-login/verification OTP model with expiry + attempt limits |
| 📦 Orders | Order creation, pricing, shipping, tax and lifecycle status |
| 🧾 Checkout | Dedicated checkout page with FaMPay transaction submission flow |
| 🛡️ API Security | Helmet, CORS, rate limiting, cookies and centralized errors |
| 🩺 Health Check | `/api/health` endpoint for API availability monitoring |

The order API calculates prices server-side, validates products/variants and stock, supports COD/online payment states, and exposes customer/admin order flows. fileciteturn3file0

---

## 🧩 Tech Stack — & Why

| Technology | Role | Why it fits MENSWARE |
|---|---|---|
| **HTML5** | Storefront structure | Lightweight, semantic and deployment-friendly |
| **CSS3** | Visual system | Enables the luxury dark theme, responsive grid, effects and transitions without a UI framework |
| **Vanilla JavaScript** | Frontend interactions | Keeps the storefront fast and dependency-light |
| **Node.js** | Backend runtime | Efficient foundation for a JavaScript full-stack application |
| **Express.js** | REST API | Simple, modular routing for commerce endpoints |
| **MongoDB** | Database | Flexible document model suits products, variants, carts and orders |
| **Mongoose** | ODM | Adds schemas, validation, indexes and relationships over MongoDB |
| **JWT** | Authentication | Stateless authentication compatible with cookies or Authorization headers |
| **Helmet** | Security headers | Hardens the Express application against common web threats |
| **CORS** | Cross-origin control | Allows the frontend and API to communicate safely across origins |
| **express-rate-limit** | Abuse protection | Limits repeated API requests |
| **Google Fonts** | Typography | Orbitron + Montserrat reinforce the futuristic luxury identity |
| **Font Awesome** | UI icons | Provides consistent interface iconography |

The backend explicitly uses Express, Mongoose, CORS, Helmet, cookie-parser, rate limiting, dotenv and JWT-related authentication infrastructure. fileciteturn11file0 fileciteturn12file0

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│       MENSWARE Storefront    │
│   HTML + CSS + Vanilla JS    │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│       Express.js API         │
│ Auth • Products • Orders     │
│ Security • Error Handling    │
└──────────────┬───────────────┘
               │ Mongoose
               ▼
┌──────────────────────────────┐
│          MongoDB             │
│ Users • Products • Carts     │
│ OTPs • Orders                │
└──────────────────────────────┘
```

### Data Layer
- **User:** customer/admin roles, account status and login metadata. fileciteturn7file0
- **Product:** categories, descriptions, images, base prices, variants, SKUs, stock and featured state. fileciteturn13file0
- **Cart:** user/session ownership, variants and quantity limits. fileciteturn4file0
- **OTP:** purpose, hashed code, attempts, expiry and consumption tracking. fileciteturn6file0
- **Order:** customer data, line items, address, totals, payment state, fulfillment status and tracking metadata. fileciteturn5file0

---

## 📁 Project Structure

```text
MENSWARE/
├── index.html          # Main storefront / product gallery
├── checkout.html       # FaMPay checkout interface
├── server.js           # Express + MongoDB API bootstrap
├── Routes.js           # Order API routes + admin order controls
├── auth.js             # JWT authentication + admin authorization
├── Cart.js             # Cart schema
├── User.js             # User schema
├── OTP.js              # OTP schema + TTL expiry
├── Order.js            # Order schema
├── product.js          # Product + variant schema
├── product.js          # Product data model
├── errorhandler.js     # Error-handling layer
├── product.js          # Product model
├── FAMPAY.jpeg         # Payment QR asset
└── *.jpeg / *.mp4      # Product / project media assets
```

> **Note:** The repository currently contains backend model/route files alongside the original static storefront. Some backend imports reference `models/` and `middleware/` paths, so the server-side structure should be aligned with those folders before production deployment.

---

## 🔌 API Surface

### Health
```http
GET /api/health
```

### Products
```http
/api/products
```

### Orders
```http
POST   /api/orders
GET    /api/orders/my
GET    /api/orders/:id
GET    /api/orders/admin/all
PATCH  /api/orders/admin/:id/status
```

Order creation validates customer information, shipping details, product existence, variant validity and stock before calculating **subtotal + shipping + 18% tax** server-side. Orders above ₹2,000 receive free shipping; otherwise shipping is ₹99. fileciteturn3file0

---

## 🔐 Security Model

MENSWARE's backend foundation includes:

- JWT verification
- Customer vs admin authorization
- HTTP security headers via Helmet
- CORS origin controls with credentials
- API rate limiting
- Body-size limits
- Disabled `x-powered-by`
- Centralized 404/error handling
- OTP expiry through MongoDB TTL indexes
- Server-side order price calculation

These measures are implemented in the current backend files rather than being only planned features. fileciteturn11file0 fileciteturn12file0 fileciteturn6file0

---

## 🚀 Local Setup

### 1. Clone

```bash
git clone https://github.com/chillingbing648-sketch/MENSWARE.git
cd MENSWARE
```

### 2. Backend dependencies

The backend imports the following Node packages:

```bash
npm install express mongoose cors helmet cookie-parser express-rate-limit dotenv jsonwebtoken
```

### 3. Environment

Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### 4. Run

```bash
node server.js
```

The API defaults to port **5000** and requires `MONGO_URI` and `JWT_SECRET` at startup. fileciteturn11file0

---

## 🎯 Product Philosophy

**MENSWARE is built around one idea:** luxury should feel deliberate.

The interface uses restrained color, strong typography, controlled motion and high-contrast product presentation to make the storefront feel closer to a premium brand experience than a generic e-commerce template.

---

## 🧭 Roadmap

- [ ] Complete frontend ↔ API integration
- [ ] Production-ready authentication flows
- [ ] Admin dashboard for catalog and orders
- [ ] Persistent product management
- [ ] Secure online payment gateway integration
- [ ] Real shipping/tracking integration
- [ ] Image optimization/CDN pipeline
- [ ] Automated testing + CI
- [ ] Production deployment configuration

---

## 📜 Status

**Development / Full-Stack Prototype** — the repository contains both the visual storefront and an expanding commerce backend. The current README intentionally documents what exists in the codebase without presenting unfinished integrations as production-ready.

---

## 👨‍💻 Author

**Harsh Dubey**  
GitHub: [@chillingbing648-sketch](https://github.com/chillingbing648-sketch)

---

<p align="center">
  <strong>MENSWARE</strong><br>
  <sub>Luxury accessories. Engineered for the modern man.</sub>
</p>
