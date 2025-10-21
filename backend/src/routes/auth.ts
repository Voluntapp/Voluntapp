import { Router } from "express";
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["volunteer", "giver"]),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, name, phone, role } = parsed.data;

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]) as any;
  if (existing.length > 0) return res.status(409).json({ error: "Email already in use" });

  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    "INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)",
    [email, hash, name, phone || null, role]
  );

  const [rows] = await pool.query("SELECT id, role FROM users WHERE email = ?", [email]) as any;
  const user = rows[0];
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const { email, password } = parsed.data;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]) as any;
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export default router;
