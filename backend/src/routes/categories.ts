import { Router } from "express";
import { z } from "zod";
import type { Category } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

const serialize = (c: Category) => ({ id: c.id, name: c.name, type: c.type, color: c.color });

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex like #f97316");

const createBody = z.object({
  name: z.string().trim().min(1).max(40),
  type: z.enum(["income", "expense", "savings"]),
  color: hexColor,
});

const updateBody = z
  .object({
    name: z.string().trim().min(1).max(40).optional(),
    color: hexColor.optional(),
  })
  .refine((v) => v.name !== undefined || v.color !== undefined, { message: "Nothing to update" });

categoriesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  res.json(rows.map(serialize));
});

categoriesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

  const existing = await prisma.category.findFirst({
    where: { userId: req.userId, type: parsed.data.type, name: parsed.data.name },
  });
  if (existing) return res.status(409).json({ error: "A category with that name and type already exists" });

  const row = await prisma.category.create({ data: { ...parsed.data, userId: req.userId! } });
  res.status(201).json(serialize(row));
});

categoriesRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });

  const result = await prisma.category.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: parsed.data,
  });
  if (result.count === 0) return res.status(404).json({ error: "Category not found" });

  const row = await prisma.category.findUnique({ where: { id: req.params.id } });
  res.json(serialize(row!));
});

categoriesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const category = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!category) return res.status(404).json({ error: "Category not found" });

  const inUse = await prisma.transaction.count({ where: { categoryId: category.id } });
  if (inUse > 0)
    return res.status(409).json({ error: `Category is used by ${inUse} transaction(s). Reassign or delete those first.` });

  await prisma.category.delete({ where: { id: category.id } });
  res.json({ ok: true });
});
