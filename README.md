# Expense Tracker (Ledgerly)

Track income, expenses, and savings; organize them with your own categories; and
see charts, monthly reports, and how much you're saving. Runs as a **desktop app**
(Electron) or in the browser.

- **Frontend:** React + Vite + TypeScript + Tailwind (`frontend/`)
- **Backend:** Express + Prisma + **SQLite** (`backend/`) — no database server to install
- **Desktop:** Electron (`electron/`)
- **Auth:** email/password, JWT in an httpOnly cookie

## Prerequisites

- Node.js 20+

## Run as a desktop app

```bash
# one time
npm install                       # root (Electron + tooling)
cd backend && cp .env.example .env && npm install && npm run migrate && cd ..   # creates the SQLite db
cd frontend && npm install && cd ..

# launch (starts backend + frontend + Electron window)
npm run desktop
```

The SQLite database lives at `backend/prisma/dev.db`. Sign up in the window and
start adding transactions — starter categories are created for you; add your own
from the **Categories** page or the **+ New** link in the add-transaction form.

(On some Linux setups Electron needs `--no-sandbox`; if the window won't open,
change the electron command in the root `package.json` to `electron electron/main.js --no-sandbox`.)

## Run in the browser instead

Skip Electron — start the two servers and open the URL:

```bash
cd backend && npm run dev      # API → http://localhost:4000
cd frontend && npm run dev     # app → http://localhost:5173
```

## Import data from an old Postgres database (optional)

If you previously ran this app on PostgreSQL, copy that data into SQLite once
(Postgres must be running):

```bash
cd backend
SOURCE_PG_URL="postgresql://expense:expense@localhost:5432/expense" npm run migrate:data
```

## Notes

- The frontend calls `/api`; Vite proxies it to port 4000 — no extra config.
- `cd backend && npm run smoke` runs an end-to-end API check.
- Full API reference: `backend/README.md`.
