import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  fetchData: async () => await ipcRenderer.invoke('fetch-data'),
  insertData: async (reclamos) => await ipcRenderer.invoke('insert-data', reclamos),
  updateData: async (reclamosId, updatedReclamos) =>
    await ipcRenderer.invoke('update-data', reclamosId, updatedReclamos),
  changeState: async (reclamoId, reclamosEstado) =>
    await ipcRenderer.invoke('change-state', reclamoId, reclamosEstado),
  installUpdate: () => ipcRenderer.send('install-update'),

  // Escucha de eventos del auto-updater
  onUpdateDownloading: (callback) => ipcRenderer.on('update-downloading', callback),
  onDownloadProgress: (callback) =>
    ipcRenderer.on('download-progress', (event, progress) => {
      callback(progress)
    })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
