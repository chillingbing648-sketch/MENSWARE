require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(v => v.trim()).filter(Boolean);
let dbPromise;

async function ensureDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (!dbPromise) dbPromise = mongoose.connect(process.env.MONGO_URI).catch(err => { dbPromise = null; throw err; });
  await dbPromise;
}

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: FRONTEND_ORIGINS, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", async (req, res) => {
  try { await ensureDatabase(); res.json({ success: true, service: "MENSWARE API", status: "healthy", database: "connected", timestamp: new Date().toISOString() }); }
  catch (e) { res.status(503).json({ success: false, service: "MENSWARE API", status: "degraded", database: "unavailable", message: e.message }); }
});

app.use("/api", async (req, res, next) => { try { await ensureDatabase(); next(); } catch (e) { next(e); } });
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(express.static(path.join(__dirname)));
app.get("/checkout", (req, res) => res.sendFile(path.join(__dirname, "checkout.html")));
app.get("/checkout.html", (req, res) => res.sendFile(path.join(__dirname, "checkout.html")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  await ensureDatabase();
  app.listen(PORT, () => console.log(`MENSWARE running on port ${PORT}`));
}
if (require.main === module) startServer().catch(err => { console.error(err); process.exit(1); });
module.exports = app;
