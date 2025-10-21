import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const oppSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.post("/", requireAuth, requireRole("giver"), async (req, res) => {
  const parsed = oppSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const giverId = (req as any).user.id;
  const { title, description, location, start_time, end_time, tags } = parsed.data;

  await pool.query(
    "INSERT INTO opportunities (giver_id, title, description, location, start_time, end_time, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [giverId, title, description || null, location || null, start_time || null, end_time || null, tags ? JSON.stringify(tags) : null]
  );

  res.json({ ok: true });
});

router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM opportunities WHERE is_active = 1 ORDER BY created_at DESC") as any;
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM opportunities WHERE id = ?", [req.params.id]) as any;
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

router.patch("/:id", requireAuth, requireRole("giver"), async (req, res) => {
  const id = Number(req.params.id);
  const giverId = (req as any).user.id;

  const [own] = await pool.query("SELECT id FROM opportunities WHERE id = ? AND giver_id = ?", [id, giverId]) as any;
  if (!own[0]) return res.status(403).json({ error: "Forbidden" });

  const { title, description, location, start_time, end_time, tags, is_active } = req.body;

  await pool.query(
    `UPDATE opportunities SET 
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      location = COALESCE(?, location),
      start_time = COALESCE(?, start_time),
      end_time = COALESCE(?, end_time),
      tags = COALESCE(?, tags),
      is_active = COALESCE(?, is_active)
     WHERE id = ?`,
    [title ?? null, description ?? null, location ?? null, start_time ?? null, end_time ?? null, tags ? JSON.stringify(tags) : null, is_active ?? null, id]
  );

  res.json({ ok: true });
});

router.delete("/:id", requireAuth, requireRole("giver"), async (req, res) => {
  const id = Number(req.params.id);
  const giverId = (req as any).user.id;

  const [own] = await pool.query("SELECT id FROM opportunities WHERE id = ? AND giver_id = ?", [id, giverId]) as any;
  if (!own[0]) return res.status(403).json({ error: "Forbidden" });

  await pool.query("UPDATE opportunities SET is_active = 0 WHERE id = ?", [id]);
  res.json({ ok: true });
});

export default router;
