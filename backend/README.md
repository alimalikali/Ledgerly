# Backend — Expense Tracker API

Express + TypeScript + Prisma + **SQLite** (embedded file, no database server).
JWT in an httpOnly cookie, bcrypt hashing.

Setup and run instructions are in the [project README](../README.md). Quick version:

```bash
cp .env.example .env
npm install
npm run migrate     # apply schema — creates prisma/dev.db
npm run dev         # http://localhost:4000
npm run smoke       # end-to-end API check (needs the server running)
```

## Scripts

| Script                | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `npm run dev`         | `tsx watch src/server.ts` — reloads on change                      |
| `npm start`           | same, without watching                                             |
| `npm run migrate`     | `prisma migrate dev` — applies migrations to `prisma/dev.db`        |
| `npm run migrate:data` | one-time import of an old Postgres database (see below)           |
| `npm run seed`        | backfills default categories users are missing; idempotent          |
| `npm run smoke`       | 17 end-to-end assertions against a running server                   |

`npm run smoke` registers two throwaway users per run and does not clean up.
Point it somewhere disposable, or expect the rows.

## Environment (`.env`)

| Var             | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| `DATABASE_URL`  | SQLite file URL, e.g. `file:./dev.db` (relative to `prisma/`) |
| `JWT_SECRET`    | secret for signing login tokens                           |
| `CLIENT_ORIGIN` | frontend URL, for CORS                                    |
| `PORT`          | API port (default 4000)                                   |

## Importing an old Postgres database

The app used to run on PostgreSQL. To copy that data across once, with Postgres
still running:

```bash
npm run migrate     # empty dev.db must exist first
SOURCE_PG_URL="postgresql://expense:expense@localhost:5432/expense" npm run migrate:data
```

Copies users → categories → transactions in FK order, preserving ids.

## API

Base path `/api`. Auth is a `token` httpOnly cookie — send requests with credentials.

| Method | Path                  | Auth | Body / Query                                                       |
| ------ | --------------------- | ---- | ----------------------------------------------------------------- |
| GET    | `/health`             | no   | —                                                                |
| POST   | `/auth/register`      | no   | `{ name, email, password }`                                       |
| POST   | `/auth/login`         | no   | `{ email, password }`                                             |
| POST   | `/auth/logout`        | no   | —                                                                |
| GET    | `/auth/me`            | yes  | current user                                                     |
| PUT    | `/auth/profile`       | yes  | `{ name?, displayCurrency? }`                                     |
| GET    | `/categories`         | yes  | —                                                                |
| POST   | `/categories`         | yes  | `{ name, type, color }`                                           |
| PUT    | `/categories/:id`     | yes  | `{ name?, color? }`                                               |
| DELETE | `/categories/:id`     | yes  | (blocked if the category is in use)                              |
| GET    | `/transactions`       | yes  | filters: `type, category, from, to, minAmount, maxAmount, search` |
| POST   | `/transactions`       | yes  | `{ description, amount, currency, categoryId, date }`             |
| PUT    | `/transactions/:id`   | yes  | partial of the create body                                       |
| DELETE | `/transactions/:id`   | yes  | —                                                                |

Category `type` is `income`, `expense`, or `savings`; a transaction's type is
taken from its category and is never accepted from the client. Amounts are `USD`
or `PKR`, dates are `YYYY-MM-DD`. Reports/savings are computed in the frontend
from the transaction list.

Only `/api/auth` is rate limited (100 requests / 15 min, `AUTH_RATE_LIMIT` to
override). Errors are `{ error: string }` with the first validation message.
