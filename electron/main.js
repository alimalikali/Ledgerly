const { app, BrowserWindow } = require("electron");

const APP_URL = process.env.APP_URL || "http://localhost:5173";

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
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
