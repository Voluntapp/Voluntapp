import type { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, or } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const COOKIE_NAME = "auth";

export function registerAuthRoutes(app: Express) {
  app.use(cookieParser());

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, phone, password, name, role } = req.body as {
        email?: string;
        phone?: string;
        password: string;
        name: string;
        role: "volunteer" | "giver";
      };

      if ((!email && !phone) || !password || !name || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Split name into first/last simplistic
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ") || null;

      // Ensure uniqueness
      if (email) {
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing[0]) return res.status(409).json({ message: "Email already in use" });
      }
      if (phone) {
        const existingPhone = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
        if (existingPhone[0]) return res.status(409).json({ message: "Phone already in use" });
      }

      await db.insert(users).values({
        email: email || null,
        phone: phone || null,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        accountType: role === "giver" ? "organization" : "volunteer",
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const [created] = await db.select().from(users).where(email ? eq(users.email, email) : eq(users.phone, phone!)).limit(1);

      const token = jwt.sign({ sub: created!.id }, JWT_SECRET, { expiresIn: "7d" });
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: isProd ? "none" : "lax", secure: isProd, maxAge: 7*24*60*60*1000 });
      res.status(201).json({ id: created!.id, token });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to sign up" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body as { identifier: string; password: string };
      if (!identifier || !password) return res.status(400).json({ message: "Missing credentials" });

      const rows = await db.select().from(users).where(or(eq(users.email, identifier), eq(users.phone, identifier))).limit(1);
      const user = rows[0];
      if (!user || !user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: isProd ? "none" : "lax", secure: isProd, maxAge: 7*24*60*60*1000 });
      res.json({ id: user.id, token });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.status(204).send();
  });

  app.get("/api/auth/user", isAuthenticated, async (req: Request & { userId?: string }, res: Response) => {
    const userId = req.userId!;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    res.json(user);
  });
}

export function isAuthenticated(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && typeof req.headers.authorization === 'string') {
      const [scheme, value] = req.headers.authorization.split(' ');
      if (scheme?.toLowerCase() === 'bearer' && value) token = value;
    }
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
