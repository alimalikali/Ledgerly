# expensetracker ("Ledgerly")

## What this is

Personal income/expense/savings tracker. Three parts: an Express + Prisma +
**SQLite** API (`backend/`), a React SPA (`frontend/`), and a thin **Electron**
shell (`electron/`) that opens the Vite dev server in a desktop window. Auth is
email/password with a JWT in an httpOnly cookie.

The repo was converted from PostgreSQL to embedded SQLite. Both `README.md`
files were updated to match; `backend/README.md` carries the full API reference.

## Commands

Three npm projects: root (Electron only), `backend/`, `frontend/`. Root deps are
**not installed yet** — `npm install` at the root before the desktop script works.

| Task | Command |
| --- | --- |
| Install | `npm install` in each of `.`, `backend`, `frontend` |
| Desktop app (all three) | `npm run desktop` (root) — backend + Vite + Electron via concurrently |
| Dev server (API) | `cd backend && npm run dev` → :4000 |
| Dev server (UI) | `cd frontend && npm run dev` → :5173 (strictPort) |
| Test | none — no test runner installed in any project |
| Test one file | none |
| End-to-end check | `cd backend && npm run smoke` (needs the API running) — 17 assertions |
| Lint | `cd frontend && npm run lint` (backend and root have none) |
| Format | `cd frontend && npm run format` |
| Build | `cd frontend && npm run build` (backend runs TS via `tsx`; Electron has no packaging step) |
| Typecheck | `npx tsc --noEmit` in `backend` or `frontend` (no npm script defined) |
| DB migrate | `cd backend && npm run migrate` |
| Import old Postgres data | `cd backend && SOURCE_PG_URL="postgresql://…" npm run migrate:data` |
| Backfill default categories | `cd backend && npm run seed` |

## Architecture

- Backend entry `backend/src/server.ts`: helmet → cors → json → cookie-parser →
  morgan, then routers under `/api/{auth,categories,transactions}`. Rate limiting
  covers `/api/auth` only. The catch-all handler returns
  `{ error: "Internal server error" }` — no stack ever reaches the client.
- `requireAuth` (`backend/src/auth.ts`) reads the `token` cookie into
  `req.userId`; the categories and transactions routers apply it router-wide.
- State is a single SQLite file, `backend/prisma/dev.db` (`DATABASE_URL="file:./dev.db"`),
  three models in `backend/prisma/schema.prisma`: `User`, `Category`,
  `Transaction`. No cache, queue, or server-side filesystem state.
- Frontend entry `frontend/src/main.tsx` → `App.tsx`: nested contexts
  (Theme → Auth → Categories → Transactions) hold *all* app state — no
  react-query, no redux. Every server call goes through
  `frontend/src/services/api.ts`.
- `electron/main.js` is a 25-line shell: one `BrowserWindow` doing
  `loadURL(process.env.APP_URL || "http://localhost:5173")`. No preload, no IPC,
  no `electron-builder`/Forge. The desktop app is the web app plus a window
  frame, and it still needs the backend process running.
- Reports, savings rate, and chart aggregation are computed client-side from the
  full transaction list. There is no reporting endpoint.

## Conventions

- Package manager: **npm**. `frontend/bun.lock` is a stale leftover from the
  original scaffold; the `package-lock.json` files are authoritative. Don't run bun.
- Frontend imports use the `@/` alias → `frontend/src` (`tsconfig.json` paths).
- `frontend/src/components/ui/` is shadcn/ui (new-york, `components.json`).
  Treat as generated; prefer the CLI over hand edits.
- Every request body and query string is validated by a zod schema at the top of
  the route file. Failures return `400 { error: <first issue message> }`;
  `api.ts` re-throws that string as the Error the UI shows.
- Each route file has a `serialize()` converting Prisma `Decimal` → `number` and
  `Date` → `"YYYY-MM-DD"`. `frontend/src/lib/types.ts` depends on that shape —
  change both together.
- Colors come from palette CSS variables set imperatively by `ThemeContext`
  (`--color-primary`, `--color-income`, `--color-expense`, `--color-chart*`).
  A hardcoded Tailwind color breaks palette switching.
- Prettier: 100 cols, double quotes, semicolons, trailing commas
  (`frontend/.prettierrc`), enforced through eslint.

## Gotchas

- **Three types, not two:** `income | expense | savings`. The `Category.type`
  comment in `schema.prisma` still says income/expense — stale. The zod enums in
  `backend/src/routes/*.ts` are the truth.
- **`Transaction.type` is never client input.** It is copied from the chosen
  category on create and re-copied whenever `categoryId` changes. Keep it out of
  request bodies.
- **Ownership lives in the `where` clause**, not in a lookup-then-act. See
  `.claude/rules/data-access.md` — getting it wrong is a cross-user data leak.
- **Electron loads a URL, never a file.** Packaging it to `file://dist/index.html`
  breaks both the `/api` Vite proxy and the auth cookie. See
  `.claude/rules/electron-shell.md` before touching `electron/main.js`.
- **SQLite has no `mode: "insensitive"`.** It was removed from the description
  search during the Postgres migration; SQLite's `LIKE` is case-insensitive for
  ASCII only, so non-ASCII search is now case-sensitive.
- **`backend/prisma/dev.db` is not gitignored** and holds real user data.
  `backend/.gitignore` lists only `node_modules`, `.env`, `dist`.
- **`npm run smoke` writes to `dev.db`** — it registers two users per run and
  does not clean up.
- **`npm run lint` already fails**: 88 errors / 10 warnings across 24 files,
  nearly all prettier formatting, all pre-existing. Run `npm run format` before
  concluding your change broke it.
- **Nothing is unit-tested.** `backend/smoke.mjs` is the only automated check.
  The shipped `rules/testing.md` assumes a suite that does not exist here yet.
- `CLIENT_ORIGIN` defaults to `http://localhost:5174` in `server.ts` while Vite
  runs on :5173. Dev works because Vite proxies `/api` → :4000, but anything
  hitting :4000 directly from a browser or a packaged shell needs it set.
- `backend/.env` holds real secrets and is gitignored; `.env.example` is the template.

## Rules

@.claude/rules/code-style.md
@.claude/rules/testing.md
@.claude/rules/security.md
@.claude/rules/data-access.md
@.claude/rules/electron-shell.md
