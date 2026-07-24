const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("granolieDesktop", {
  openWriterWithClipboard: () => ipcRenderer.invoke("granolie:open-writer-with-clipboard"),
  openExternal: (url) => ipcRenderer.invoke("granolie:open-external", url),
  showEditMenu: () => ipcRenderer.send("granolie:show-edit-menu"),
});
