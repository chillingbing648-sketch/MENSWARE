const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getToken(req) {
  return req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
}

async function authenticate(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-__v");
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: "Invalid authentication" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication" });
  }
}

async function optionalAuthenticate(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-__v");
    if (user?.isActive) req.user = user;
  } catch {}
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Administrator access required" });
  next();
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin };
