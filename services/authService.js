const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register({ name, email, password, phone }) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!name || !normalizedEmail || !password || String(password).length < 8) {
    const error = new Error("Name, email and an 8+ character password are required");
    error.statusCode = 400;
    throw error;
  }
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: phone || null, passwordHash });
  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user || !user.isActive || !user.passwordHash || !(await bcrypt.compare(String(password || ""), user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  user.lastLoginAt = new Date();
  await user.save();
  return { user, token: signToken(user) };
}

module.exports = { register, login, setAuthCookie, publicUser };
