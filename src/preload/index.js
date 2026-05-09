import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    // optional
    contextBridge.exposeInMainWorld('electron', electronAPI)

    // ✅ hanya SEKALI define api
    contextBridge.exposeInMainWorld('api', {
      product: {
        add: (data) => ipcRenderer.invoke('product:add', data),
        getAll: () => ipcRenderer.invoke('product:getAll'),
        getById: (id) => ipcRenderer.invoke('product:getById', id),
        update: (data) => ipcRenderer.invoke('product:update', data),
        delete: (id) => ipcRenderer.invoke('product:delete', id)
      },
      transaction: {
        add: (data) => ipcRenderer.invoke('transaction:add', data),
        getAll: () => ipcRenderer.invoke('transaction:getAll'),
        getById: (id) => ipcRenderer.invoke('transaction:getById', id),
        getReport: (params) => ipcRenderer.invoke('transaction:getReport', params),
        getBestSelling: (params) => ipcRenderer.invoke('transaction:getBestSelling', params),
        getHourlySales: (params) => ipcRenderer.invoke('transaction:getHourlySales', params),
        getInventoryReport: () => ipcRenderer.invoke('transaction:getInventoryReport')
      },
      dashboard: {
        getData: () => ipcRenderer.invoke('dashboard:getData')
      }
    })
  } catch (error) {
    console.error(error)
  }
}
