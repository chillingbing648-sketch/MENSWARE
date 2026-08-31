require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const orderRoutes = require("./Routes");
const productRoutes = require("./routes/productRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

const app = express();

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

/* ---------------- SECURITY ---------------- */

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ---------------- BODY ---------------- */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

/* ---------------- HEALTH ---------------- */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "MENSWARE API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/* ---------------- API ---------------- */

app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);

/* ---------------- ERRORS ---------------- */

app.use(notFound);
app.use(errorHandler);

/* ---------------- DATABASE ---------------- */

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(
        `MENSWARE API running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Database connection failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

module.exports = app;
