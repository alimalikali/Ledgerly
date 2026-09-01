const { app, BrowserWindow } = require("electron");
const { fork } = require("child_process");
const path = require("path");
const fs = require("fs");

let serverProcess = null;
let APP_URL = process.env.APP_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    title: "Ledgerly",
    backgroundColor: "#0a0a0a",
    webPreferences: { contextIsolation: true },
  });
  win.loadURL(APP_URL);
}

app.whenReady().then(() => {
  if (APP_URL) {
    createWindow();
  } else {
    // Setup SQLite DB in user data directory
    const dbPath = path.join(app.getPath("userData"), "ledgerly.db");
    if (!fs.existsSync(dbPath)) {
      const templateDb = path.join(__dirname, "../backend/prisma/dev.db");
      if (fs.existsSync(templateDb)) {
        fs.copyFileSync(templateDb, dbPath);
      }
    }

    // Start backend dynamically
    serverProcess = fork(path.join(__dirname, "../backend/dist/src/server.js"), [], {
      env: { ...process.env, PORT: "0", DATABASE_URL: "file:" + dbPath },
      stdio: "pipe"
    });

    serverProcess.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(`[Backend]: ${output}`);
      const match = output.match(/API listening on (http:\/\/localhost:\d+)/);
      if (match && !APP_URL) {
        APP_URL = match[1];
        createWindow();
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`[Backend Error]: ${data}`);
    });
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && APP_URL) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
