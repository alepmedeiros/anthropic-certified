import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { db } from "../db/connection";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || !EMAIL_RE.test(email) || password.length < 8) {
    return res.status(400).json({ error: "Valid email and password (min 8 chars) required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const info = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, passwordHash);
  const token = jwt.sign({ userId: info.lastInsertRowid }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: info.lastInsertRowid, email } });
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email) as
    | { id: number; email: string; password_hash: string }
    | undefined;
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

export default router;
