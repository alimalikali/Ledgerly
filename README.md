# 💸 Ledgerly

Personal income, expense, and savings tracker. Add transactions, sort them into
your own categories, and see where the money went. Runs as a **desktop app** or
in the browser.

## 🧱 Stack

| | |
| --- | --- |
| 🖥️ Frontend | React + Vite + TypeScript + Tailwind (`frontend/`) |
| ⚙️ Backend | Express + Prisma (`backend/`) |
| 🗄️ Database | SQLite — a single file, no server to install |
| 🪟 Desktop | Electron (`electron/`) |
| 🔐 Auth | Email + password, JWT in an httpOnly cookie |

## 📋 Requirements

Node.js 20 or newer. That's it.

## 🚀 Setup

```bash
git clone https://github.com/alimalikali/Ledgerly.git
cd Ledgerly

npm install                    # installs root, backend, and frontend

cd backend
cp .env.example .env           # then set JWT_SECRET to any long random string
npm run migrate                # creates prisma/dev.db
cd ..
```

## ▶️ Run

```bash
npm run desktop                # backend + frontend + Electron window
```

Prefer the browser? Start the two servers in separate terminals:

```bash
cd backend && npm run dev      # API  → http://localhost:4000
cd frontend && npm run dev     # app  → http://localhost:5173
```

Sign up, and starter categories are created for you. Your data lives in
`backend/prisma/dev.db` — gitignored, so back it up yourself.

## 📖 More

- 📡 API reference → [`backend/README.md`](backend/README.md)
- ✅ End-to-end check → `cd backend && npm run smoke`
- 📦 Import from an old Postgres database:
  ```bash
  cd backend && SOURCE_PG_URL="postgresql://user:pass@localhost:5432/expense" npm run migrate:data
  ```

## 🩹 Troubleshooting

| Problem | Fix |
| --- | --- |
| Electron window won't open on Linux | The `desktop` script already passes `--no-sandbox` |
| Every API call returns 500 | You skipped `cp .env.example .env` in `backend/` |
| `@prisma/client did not initialize` | `cd backend && npx prisma generate` |
