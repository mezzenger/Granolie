const path = require("node:path");
const fs = require("node:fs/promises");
const { spawn } = require("node:child_process");
const { app, BrowserWindow, dialog, ipcMain, Menu, session, shell } = require("electron");

let mainWindow = null;
let serverHandle = null;
let isQuitting = false;
let systemAudioCapture = null;

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

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => reject(error));
    child.once("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error(stderr.trim() || `${command} exited with code ${code}.`));
    });
  });
}

async function getDefaultMonitorSource() {
  let sink = "";
  try {
    sink = await runCommand("pactl", ["get-default-sink"]);
  } catch {
    const info = await runCommand("pactl", ["info"]);
    sink = (info.match(/^Default Sink:\s*(.+)$/m) || [])[1] || "";
  }

  if (!sink) {
    throw new Error("Granolie could not determine the active PipeWire output.");
  }

  return `${sink}.monitor`;
}

function waitForExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode) {
      resolve();
      return;
    }
    child.once("close", resolve);
    child.kill("SIGINT");
  });
}

async function discardSystemAudioCapture() {
  const capture = systemAudioCapture;
  systemAudioCapture = null;
  if (!capture) {
    return;
  }

  await waitForExit(capture.process);
  await fs.rm(capture.directory, { force: true, recursive: true });
}

async function startSystemAudioCapture() {
  if (systemAudioCapture) {
    throw new Error("Computer audio capture is already running.");
  }

  const source = await getDefaultMonitorSource();
  const directory = await fs.mkdtemp(path.join(app.getPath("temp"), "granolie-audio-"));
  const sourceFile = path.join(directory, "computer-audio.wav");
  const process = spawn("pw-record", [
    "--target", source,
    "--rate", "48000",
    "--channels", "2",
    "--format", "s16",
    "--container", "wav",
    sourceFile,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const capture = { directory, process, sourceFile, startupError: "" };
  process.stderr.on("data", (chunk) => {
    capture.startupError += chunk.toString();
  });

  await new Promise((resolve, reject) => {
    process.once("spawn", resolve);
    process.once("error", reject);
  });

  systemAudioCapture = capture;
  return { ok: true };
}

async function finishSystemAudioCapture({ microphoneAudioBase64 = "", microphoneMimeType = "audio/webm" } = {}) {
  const capture = systemAudioCapture;
  systemAudioCapture = null;
  if (!capture) {
    throw new Error("No computer audio capture is running.");
  }

  try {
    await waitForExit(capture.process);
    const outputFile = path.join(capture.directory, "recording.webm");
    const args = ["-y", "-i", capture.sourceFile];
    if (microphoneAudioBase64) {
      const microphoneFile = path.join(capture.directory, microphoneMimeType.includes("ogg") ? "microphone.ogg" : "microphone.webm");
      await fs.writeFile(microphoneFile, Buffer.from(microphoneAudioBase64, "base64"));
      args.push("-i", microphoneFile, "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest:normalize=0[a]", "-map", "[a]");
    }
    args.push("-c:a", "libopus", "-b:a", "128k", outputFile);
    await runCommand("ffmpeg", args);
    return {
      audioBase64: (await fs.readFile(outputFile)).toString("base64"),
      fileName: `recording-${Date.now()}.webm`,
      mimeType: "audio/webm",
    };
  } catch (error) {
    const detail = capture.startupError.trim();
    throw new Error(detail || error.message || "Could not capture computer audio through PipeWire.");
  } finally {
    await fs.rm(capture.directory, { force: true, recursive: true });
  }
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

  ipcMain.handle("granolie:open-external", async (_event, url) => {
    await shell.openExternal(url);
  });

  ipcMain.handle("granolie:start-system-audio-capture", () => startSystemAudioCapture());
  ipcMain.handle("granolie:finish-system-audio-capture", (_event, payload) => finishSystemAudioCapture(payload));
  ipcMain.handle("granolie:cancel-system-audio-capture", () => discardSystemAudioCapture());
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
      .then(() => discardSystemAudioCapture())
      .then(() => stopBackend())
      .catch((error) => {
        console.error("Failed to stop Granolie backend cleanly:", error);
      })
      .finally(() => {
        app.quit();
      });
  });
}
