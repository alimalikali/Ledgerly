# Data access

Every row in `Category` and `Transaction` belongs to a `User`. There is no
tenant middleware and no Prisma extension enforcing that — each query does it
itself. Get it wrong and one user edits another user's data.

## Scope by `userId` in the `where` clause

Never `findUnique`/`update`/`delete` on an id alone for a user-owned row. The id
is a cuid the client supplies; owning it is not implied.

```ts
// wrong — any logged-in user can PUT someone else's transaction id
await prisma.transaction.update({ where: { id: req.params.id }, data });

// right — the ownership check and the write are the same query
const result = await prisma.transaction.deleteMany({ where: { id: req.params.id, userId: req.userId } });
if (result.count === 0) return res.status(404).json({ error: "Transaction not found" });
```

Reads use `findFirst({ where: { id, userId } })`, not `findUnique({ where: { id } })`.
Writes use `updateMany` / `deleteMany` with `userId` in the `where` and check
`result.count === 0` → 404. When a follow-up `findUnique` is needed to return
the fresh row (see `categories.ts` PUT), it runs *after* the scoped write proved
ownership.

A missing row and a row owned by someone else both return **404**, never 403 —
existence is not leaked.

## Foreign keys from the client are validated the same way

`categoryId` on a transaction comes from the client. Resolve it through
`ownedCategory(userId, categoryId)` (`routes/transactions.ts`) and reject with
400 if it returns null. Do not pass a client `categoryId` straight into
`prisma.transaction.create`.

## Derived fields are server-set

`Transaction.type` mirrors `category.type` and is assigned from the resolved
category on both create and update. It is not in the zod body schema — keep it
out.
