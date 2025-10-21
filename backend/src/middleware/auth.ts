import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthUser {
  id: number;
  role: "volunteer" | "giver";
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = hdr.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role: "volunteer" | "giver") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser;
    if (!user || user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
