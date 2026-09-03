# MENSWARE Architecture

## Current target structure

```text
MENSWARE/
├── index.html                 # Storefront shell
├── checkout.html              # Checkout shell
├── assets/
│   └── js/
│       ├── app.js             # Storefront client behavior + API calls
│       └── checkout.js        # Checkout client behavior + API calls
├── config/
│   └── database.js            # MongoDB connection lifecycle
├── middleware/
│   ├── auth.js                # Authentication + authorization
│   └── errorHandler.js        # Central HTTP error handling
├── models/                    # Mongoose persistence models
├── routes/                    # Thin HTTP route adapters
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
├── services/                  # Business/domain operations
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   └── orderService.js
├── tests/                     # Regression tests
├── server.js                  # Composition root / application entrypoint
├── vercel.json                # Deployment and route mapping
└── package.json               # Scripts and dependencies
```

## Request flow

```text
Browser
  │
  ├── HTML shell
  └── assets/js/*
       │
       ▼
    /api/*
       │
       ▼
  Express routes
       │
       ├── auth middleware
       └── service layer
              │
              ▼
          Mongoose models
              │
              ▼
           MongoDB
```

## Architectural improvements made

1. **Thin routes:** HTTP routing no longer contains most commerce business logic.
2. **Service layer:** authentication, products, carts and orders have explicit business modules.
3. **Database boundary:** MongoDB connection lifecycle is isolated in `config/database.js`.
4. **Frontend separation:** storefront and checkout behavior are no longer embedded in large HTML files.
5. **Atomic checkout:** variant stock is decremented inside a MongoDB transaction before the order is committed.
6. **Allowlisted state:** payment methods and order statuses are explicit constants.
7. **Automated verification:** syntax checks and Node regression tests run through `npm run verify`.
8. **Deployment routing:** `/checkout` and frontend JavaScript assets have explicit Vercel routes.

## Design rules

- Routes translate HTTP requests into service calls.
- Services own business rules and orchestration.
- Models own persistence schema and indexes.
- Middleware owns cross-cutting concerns such as authentication and errors.
- Browser code talks to the backend through `/api/*`; it does not access MongoDB directly.
- Never trust client-side prices, quantities, roles or stock state. Checkout recalculates prices and validates stock on the server.

## Next architecture phase

- Add request validation schemas (for example Zod/Joi).
- Add repository interfaces if the persistence layer grows.
- Add integration tests using a disposable MongoDB environment.
- Add payment-provider adapters rather than treating `online` as a completed payment.
- Add cart-to-user merge after login.
- Add structured logging and request IDs.
- Add CSRF strategy if the cookie-auth surface expands beyond same-site usage.
