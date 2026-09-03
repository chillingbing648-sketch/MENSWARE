require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { connectDatabase } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGINS = (process.env.FRONTEND_URL || "http://localhost:5000")
  .split(",").map(value => value.trim()).filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: FRONTEND_ORIGINS, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", async (req, res) => {
  try {
    await connectDatabase();
    res.json({ success: true, service: "MENSWARE API", status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, service: "MENSWARE API", status: "degraded", database: "unavailable", timestamp: new Date().toISOString() });
  }
});

app.use("/api", async (req, res, next) => {
  try { await connectDatabase(); next(); }
  catch (error) { next(error); }
});
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
  await connectDatabase();
  app.listen(PORT, () => console.log(`MENSWARE API running on port ${PORT}`));
}

if (require.main === module) startServer().catch(error => { console.error(error); process.exit(1); });
module.exports = app;
