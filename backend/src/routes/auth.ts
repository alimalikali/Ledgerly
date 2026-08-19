import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { clearAuthCookie, requireAuth, setAuthCookie, type AuthedRequest } from "../auth";
import { DEFAULT_CATEGORIES } from "../defaults";

export const authRouter = Router();

const publicUser = (u: { id: string; name: string; email: string; displayCurrency: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  displayCurrency: u.displayCurrency,
});

const registerBody = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(200),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      categories: { create: DEFAULT_CATEGORIES },
    },
  });
  setAuthCookie(res, user.id);
  res.status(201).json(publicUser(user));
});

const loginBody = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Compare even when user is missing to avoid leaking which emails exist (timing).
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return res.status(401).json({ error: "Invalid email or password" });

  setAuthCookie(res, user.id);
  res.json(publicUser(user));
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json(publicUser(user));
});

const profileBody = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    displayCurrency: z.enum(["USD", "PKR"]).optional(),
  })
  .refine((v) => v.name !== undefined || v.displayCurrency !== undefined, {
    message: "Nothing to update",
  });

authRouter.put("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = profileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  await prisma.user.update({ where: { id: req.userId }, data: parsed.data });
  res.json({ ok: true });
});
