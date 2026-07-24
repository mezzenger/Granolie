const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("granolieDesktop", {
  openWriterWithClipboard: () => ipcRenderer.invoke("granolie:open-writer-with-clipboard"),
  openExternal: (url) => ipcRenderer.invoke("granolie:open-external", url),
  startSystemAudioCapture: () => ipcRenderer.invoke("granolie:start-system-audio-capture"),
  finishSystemAudioCapture: (payload) => ipcRenderer.invoke("granolie:finish-system-audio-capture", payload),
  cancelSystemAudioCapture: () => ipcRenderer.invoke("granolie:cancel-system-audio-capture"),
  showEditMenu: () => ipcRenderer.send("granolie:show-edit-menu"),
});
