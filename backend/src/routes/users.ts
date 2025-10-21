import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const [rows] = await pool.query(
    "SELECT id, email, name, phone, role, email_verified, phone_verified FROM users WHERE id = ?",
    [userId]
  ) as any;
  res.json(rows[0]);
});

const updateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const userId = (req as any).user.id;
  const { name, phone } = parsed.data;

  await pool.query(
    "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?",
    [name ?? null, phone ?? null, userId]
  );

  res.json({ ok: true });
});

router.post("/verify/email", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await pool.query("UPDATE users SET email_verified = 1 WHERE id = ?", [userId]);
  res.json({ ok: true });
});

router.post("/verify/phone", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  await pool.query("UPDATE users SET phone_verified = 1 WHERE id = ?", [userId]);
  res.json({ ok: true });
});

export default router;
