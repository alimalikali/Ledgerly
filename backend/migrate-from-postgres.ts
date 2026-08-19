// One-time import of existing Postgres data into the new SQLite database.
// Run AFTER `npm run migrate` (empty dev.db exists) and while Postgres is still up:
//
//   SOURCE_PG_URL="postgresql://expense:expense@localhost:5432/expense" npm run migrate:data
//
// Copies users → categories → transactions (FK order), preserving ids.
import { Client } from "pg";
import { prisma } from "./src/prisma";

const url = process.env.SOURCE_PG_URL;
if (!url) {
  console.error('Set SOURCE_PG_URL, e.g. SOURCE_PG_URL="postgresql://expense:expense@localhost:5432/expense"');
  process.exit(1);
}

const pg = new Client({ connectionString: url });
await pg.connect();

const users = (await pg.query('SELECT * FROM "User"')).rows;
const categories = (await pg.query('SELECT * FROM "Category"')).rows;
const transactions = (await pg.query('SELECT * FROM "Transaction"')).rows;
await pg.end();

for (const u of users) {
  await prisma.user.create({
    data: {
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.passwordHash,
      displayCurrency: u.displayCurrency,
      createdAt: u.createdAt,
    },
  });
}

for (const c of categories) {
  await prisma.category.create({
    data: { id: c.id, userId: c.userId, name: c.name, type: c.type, color: c.color, createdAt: c.createdAt },
  });
}

for (const t of transactions) {
  await prisma.transaction.create({
    data: {
      id: t.id,
      userId: t.userId,
      categoryId: t.categoryId,
      description: t.description,
      amount: t.amount, // pg numeric string → Prisma Decimal
      currency: t.currency,
      type: t.type,
      date: t.date,
      createdAt: t.createdAt,
    },
  });
}

console.log(
  `Imported ${users.length} user(s), ${categories.length} categorie(s), ${transactions.length} transaction(s) into SQLite.`,
);
await prisma.$disconnect();
