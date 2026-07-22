const path = require("node:path");
const { spawn } = require("node:child_process");
const { app, BrowserWindow, desktopCapturer, dialog, ipcMain, Menu, session, shell } = require("electron");

let mainWindow = null;
let serverHandle = null;
let isQuitting = false;

const ALLOWED_PERMISSIONS = new Set(["clipboard-sanitized-write", "fullscreen", "media"]);
const { cleanupEmptySessions, getAppInfo, startServer } = require(path.join(__dirname, "..", "server"));

function getWriterUnoHelperPath() {
  const candidates = [];
  if (process.resourcesPath) {
    candidates.push(path.join(process.resourcesPath, "lo-uno", "paste_clipboard.py"));
  }
  candidates.push(path.join(__dirname, "..", "scripts", "lo-uno", "paste_clipboard.py"));
  return candidates.find((candidate) => require("node:fs").existsSync(candidate));
}

function runWriterUnoHelper() {
  const helperPath = getWriterUnoHelperPath();
  if (!helperPath) {
    return Promise.reject(new Error("Granolie's LibreOffice helper is missing."));
  }

  const python = process.env.GRANOLIE_PYTHON_BIN || "python3";
  return new Promise((resolve, reject) => {
    const helper = spawn(python, [helperPath], { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    helper.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    helper.once("error", () => reject(new Error("Python is required for the LibreOffice Writer integration.")));
    helper.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || "LibreOffice Writer could not paste the clipboard contents."));
    });
  });
}

function configureIpc() {
  ipcMain.on("granolie:show-edit-menu", (event) => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender);
    if (!targetWindow) {
      return;
    }

    const menu = Menu.buildFromTemplate([
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectAll" },
    ]);
    menu.popup({ window: targetWindow });
  });

  ipcMain.handle("granolie:open-writer-with-clipboard", async () => {
    await runWriterUnoHelper();

    return { ok: true };
  });
}

function configurePermissions() {
  const defaultSession = session.defaultSession;

  defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.has(permission));
  });

  if (typeof defaultSession.setPermissionCheckHandler === "function") {
    defaultSession.setPermissionCheckHandler((_webContents, permission) => {
      return ALLOWED_PERMISSIONS.has(permission);
    });
  }

  defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ["screen"] });
      const source = sources.find((item) => item.id.startsWith("screen:"));
      callback(source ? { video: source, audio: "loopback" } : {});
    } catch {
      callback({});
    }
  });
}

async function startBackend() {
  if (serverHandle) {
    return serverHandle;
  }

  process.env.GRANOLIE_DATA_DIR = app.getPath("userData");
  serverHandle = await startServer({ port: 0, log: false });
  return serverHandle;
}

async function stopBackend() {
  if (!serverHandle?.server) {
    return;
  }

  await new Promise((resolve, reject) => {
    serverHandle.server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  serverHandle = null;
}

async function createMainWindow() {
  const backend = await startBackend();
  const appInfo = getAppInfo();

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    backgroundColor: "#111417",
    height: 960,
    minHeight: 760,
    minWidth: 1100,
    show: false,
    title: appInfo.windowTitle,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
      spellcheck: true,
    },
    width: 1440,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(backend.url);
}

async function bootDesktopApp() {
  configurePermissions();
  configureIpc();
  await createMainWindow();
}

const hasLock = app.requestSingleInstanceLock();

if (!hasLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) {
      createMainWindow().catch((error) => {
        dialog.showErrorBox("Granolie failed to reopen", error.message || String(error));
      });
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  });

  app.whenReady().then(() => {
    return bootDesktopApp().catch((error) => {
      console.error(error);
      dialog.showErrorBox("Granolie failed to start", error.stack || error.message || String(error));
      app.quit();
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow().catch((error) => {
        dialog.showErrorBox("Granolie failed to activate", error.message || String(error));
      });
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", (event) => {
    if (isQuitting || !serverHandle?.server) {
      return;
    }

    event.preventDefault();
    isQuitting = true;

    cleanupEmptySessions()
      .catch((error) => {
        console.error("Failed to remove empty Granolie sessions:", error);
      })
      .then(() => stopBackend())
      .catch((error) => {
        console.error("Failed to stop Granolie backend cleanly:", error);
      })
      .finally(() => {
        app.quit();
      });
  });
}
