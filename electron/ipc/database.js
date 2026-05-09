import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

ipcMain.handle('database:backup', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: `backup-${Date.now()}.db`,
      filters: [
        {
          name: 'SQLite Database',
          extensions: ['db']
        }
      ]
    })

    if (!filePath) {
      return {
        success: false,
        message: 'Dibatalkan'
      }
    }

    fs.copyFileSync('app.db', filePath)

    return {
      success: true,
      path: filePath
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
})
