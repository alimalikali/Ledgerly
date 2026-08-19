// One-time backfill: give existing users any default categories they're missing
// (e.g. the new Savings ones). Idempotent — upsert on the unique (userId, type,
// name) key, so re-running only adds what's absent.
//
//   npm run seed
import { prisma } from "./src/prisma";
import { DEFAULT_CATEGORIES } from "./src/defaults";

const users = await prisma.user.findMany({ select: { id: true } });
let added = 0;
for (const u of users) {
  for (const c of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { userId_type_name: { userId: u.id, type: c.type, name: c.name } },
    });
    if (existing) continue;
    await prisma.category.create({ data: { ...c, userId: u.id } });
    added += 1;
  }
}
console.log(`Added ${added} missing default categorie(s) across ${users.length} user(s).`);
await prisma.$disconnect();
