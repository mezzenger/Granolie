const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("granolieDesktop", {
  openWriterWithClipboard: () => ipcRenderer.invoke("granolie:open-writer-with-clipboard"),
  showEditMenu: () => ipcRenderer.send("granolie:show-edit-menu"),
});
