# Electron shell

`electron/main.js` is a window around the running Vite dev server:
`loadURL(process.env.APP_URL || "http://localhost:5173")`. Everything the app
does still goes over HTTP to the backend on :4000. Three things break the moment
that assumption is dropped.

## Do not load the app from `file://`

`frontend/src/services/api.ts` uses `const BASE_URL = "/api"` — a relative URL.
Under `file://` it resolves to `file:///api` and every request fails. Under
`http://localhost:5173` it hits the Vite proxy defined in `vite.config.ts`.

Cookies are the second half of the problem: auth is an httpOnly `token` cookie
with `sameSite: "lax"`, and `fetch(..., { credentials: "include" })`. A `file://`
origin has no cookie jar the backend can set into, so login silently stops
persisting.

Packaging for real means serving the built `frontend/dist` over `http://` from
the main process (or from the Express app) and pointing `APP_URL` at it — not
`win.loadFile()`.

## Keep the renderer sandboxed

`webPreferences: { contextIsolation: true }` and no `nodeIntegration`. The
renderer is ordinary web code that already has a network API for everything it
needs; it has no reason to touch `fs`, `child_process`, or `ipcRenderer`. If a
feature seems to need Node in the renderer, add a preload script with a narrow
`contextBridge` surface instead of opening the sandbox.

## The port is load-bearing

The root `desktop` script is `wait-on http://localhost:5173 && electron …`, and
`vite.config.ts` sets `port: 5173, strictPort: true` so Vite fails instead of
silently moving to 5174. Changing either one without the other makes the
Electron window open on a dead URL or race the dev server.
