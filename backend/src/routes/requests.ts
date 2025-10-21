import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const requestSchema = z.object({
  opportunity_id: z.number(),
  message: z.string().optional(),
});

router.post("/", requireAuth, requireRole("volunteer"), async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const volunteerId = (req as any).user.id;
  const { opportunity_id, message } = parsed.data;

  const [opp] = await pool.query("SELECT id, is_active FROM opportunities WHERE id = ?", [opportunity_id]) as any;
  if (!opp[0] || opp[0].is_active !== 1) return res.status(400).json({ error: "Opportunity not available" });

  await pool.query(
    "INSERT INTO requests (opportunity_id, volunteer_id, message) VALUES (?, ?, ?)",
    [opportunity_id, volunteerId, message || null]
  );

  res.json({ ok: true });
});

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;

  if (user.role === "volunteer") {
    const [rows] = await pool.query(
      "SELECT * FROM requests WHERE volunteer_id = ? ORDER BY created_at DESC",
      [user.id]
    ) as any;
    return res.json(rows);
  } else {
    const [rows] = await pool.query(
      `SELECT r.* 
       FROM requests r
       JOIN opportunities o ON r.opportunity_id = o.id
       WHERE o.giver_id = ?
       ORDER BY r.created_at DESC`,
      [user.id]
    ) as any;
    return res.json(rows);
  }
});

const updateSchema = z.object({
  status: z.enum(["pending", "accepted", "declined", "completed", "cancelled"]),
});

router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const id = Number(req.params.id);
  const user = (req as any).user;

  const [rows] = await pool.query(
    `SELECT r.*, o.giver_id 
     FROM requests r
     JOIN opportunities o ON r.opportunity_id = o.id
     WHERE r.id = ?`,
    [id]
  ) as any;

  const reqRow = rows[0];
  if (!reqRow) return res.status(404).json({ error: "Not found" });

  const nextStatus = parsed.data.status;

  if (user.role === "giver") {
    if (user.id !== reqRow.giver_id) return res.status(403).json({ error: "Forbidden" });
    if (!["accepted", "declined", "completed"].includes(nextStatus))
      return res.status(400).json({ error: "Invalid status for giver" });
  } else {
    if (user.id !== reqRow.volunteer_id) return res.status(403).json({ error: "Forbidden" });
    if (!["cancelled", "completed"].includes(nextStatus))
      return res.status(400).json({ error: "Invalid status for volunteer" });
  }

  await pool.query("UPDATE requests SET status = ? WHERE id = ?", [nextStatus, id]);
  res.json({ ok: true });
});

router.get("/opportunity/:id", requireAuth, requireRole("giver"), async (req, res) => {
  const giverId = (req as any).user.id;
  const oppId = Number(req.params.id);

  const [own] = await pool.query(
    "SELECT id FROM opportunities WHERE id = ? AND giver_id = ?",
    [oppId, giverId]
  ) as any;
  if (!own[0]) return res.status(403).json({ error: "Forbidden" });

  const [rows] = await pool.query(
    "SELECT * FROM requests WHERE opportunity_id = ? ORDER BY created_at DESC",
    [oppId]
  ) as any;

  res.json(rows);
});

export default router;
