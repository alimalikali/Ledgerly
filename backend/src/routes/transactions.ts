import { Router } from "express";
import { z } from "zod";
import type { Prisma, Transaction } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuth, type AuthedRequest } from "../auth.js";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

// Shape matches the client Transaction:
// { id, description, amount:number, currency, type, categoryId, date:"YYYY-MM-DD" }
const serialize = (t: Transaction) => ({
  id: t.id,
  description: t.description,
  amount: Number(t.amount),
  currency: t.currency,
  type: t.type,
  categoryId: t.categoryId,
  date: t.date.toISOString().slice(0, 10),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const createBody = z.object({
  description: z.string().trim().min(1).max(200),
  amount: z.number().positive().finite(),
  currency: z.enum(["USD", "PKR"]),
  categoryId: z.string().min(1),
  date: isoDate,
});

const updateBody = createBody.partial();

const filters = z.object({
  type: z.enum(["income", "expense", "savings"]).optional(),
  category: z.string().optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
});

// Resolve a category the user owns; returns null if it isn't theirs.
async function ownedCategory(userId: string, categoryId: string) {
  return prisma.category.findFirst({ where: { id: categoryId, userId } });
}

transactionsRouter.get("/", async (req: AuthedRequest, res) => {
  const parsed = filters.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid filters" });
  const f = parsed.data;

  const where: Prisma.TransactionWhereInput = { userId: req.userId };
  if (f.type) where.type = f.type;
  if (f.category) where.categoryId = f.category;
  if (f.from || f.to) where.date = { ...(f.from && { gte: new Date(f.from) }), ...(f.to && { lte: new Date(f.to) }) };
  // ponytail: amount filter compares raw stored amounts, not currency-normalized.
  if (f.minAmount !== undefined || f.maxAmount !== undefined) {
    where.amount = { ...(f.minAmount !== undefined && { gte: f.minAmount }), ...(f.maxAmount !== undefined && { lte: f.maxAmount }) };
  }
  if (f.search) where.description = { contains: f.search };

  const rows = await prisma.transaction.findMany({ where, orderBy: { date: "desc" } });
  res.json(rows.map(serialize));
});

transactionsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  const d = parsed.data;

  const category = await ownedCategory(req.userId!, d.categoryId);
  if (!category) return res.status(400).json({ error: "Unknown category" });

  const row = await prisma.transaction.create({
    data: {
      description: d.description,
      amount: d.amount,
      currency: d.currency,
      categoryId: category.id,
      type: category.type, // derived from the category — single source of truth
      date: new Date(d.date),
      userId: req.userId!,
    },
  });
  res.status(201).json(serialize(row));
});

transactionsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  const d = parsed.data;

  const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Transaction not found" });

  const data: Prisma.TransactionUpdateInput = {};
  if (d.description !== undefined) data.description = d.description;
  if (d.amount !== undefined) data.amount = d.amount;
  if (d.currency !== undefined) data.currency = d.currency;
  if (d.date !== undefined) data.date = new Date(d.date);
  if (d.categoryId !== undefined) {
    const category = await ownedCategory(req.userId!, d.categoryId);
    if (!category) return res.status(400).json({ error: "Unknown category" });
    data.category = { connect: { id: category.id } };
    data.type = category.type;
  }

  const row = await prisma.transaction.update({ where: { id: existing.id }, data });
  res.json(serialize(row));
});

transactionsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const result = await prisma.transaction.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  if (result.count === 0) return res.status(404).json({ error: "Transaction not found" });
  res.json({ ok: true });
});
