import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const COOKIE = "token";
const isProd = process.env.NODE_ENV === "production";

// Read lazily so .env is already loaded (see env.ts) when these run.
const secret = () => process.env.JWT_SECRET || "dev-secret-change-me";

export function setAuthCookie(res: Response, userId: string) {
  const token = jwt.sign({ userId }, secret(), { expiresIn: "7d" });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax", secure: isProd, path: "/" });
}

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const { userId } = jwt.verify(token, secret()) as { userId: string };
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
}
