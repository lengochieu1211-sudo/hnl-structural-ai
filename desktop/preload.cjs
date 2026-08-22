const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('hnlDesktop', {
  isDesktop: true,
  saveProject: (project) => ipcRenderer.invoke('hnl:save-project', project),
  openProject: () => ipcRenderer.invoke('hnl:open-project'),
  platform: process.platform,
});
