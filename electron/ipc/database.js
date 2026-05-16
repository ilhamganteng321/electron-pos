// electron/ipc/database.js
import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import { closeDatabase, initDatabase, dbPath, getDb } from '../db'

/**
 * 💾 BACKUP DATABASE
 */
ipcMain.handle('database:backup', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Backup Database',
      defaultPath: `backup-${Date.now()}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }]
    })

    if (!filePath) {
      return { success: false, message: 'Backup dibatalkan' }
    }

    fs.copyFileSync(dbPath, filePath) // ✅ pakai dbPath dari import

    return {
      success: true,
      path: filePath,
      message: `Backup berhasil disimpan di ${filePath}`
    }
  } catch (err) {
    console.error('Backup error:', err)
    return { success: false, message: err.message || 'Gagal melakukan backup database' }
  }
})

/**
️ 💾 RESTORE DATABASE
 */
ipcMain.handle('database:restore', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Database',
      properties: ['openFile'],
      filters: [
        {
          name: 'SQLite Database',
          extensions: ['db']
        }
      ]
    })

    if (!filePaths || filePaths.length === 0) {
      return {
        success: false,
        message: 'Restore dibatalkan'
      }
    }

    const sourceFile = filePaths[0]

    await closeDatabase()

    fs.copyFileSync(sourceFile, dbPath)

    await initDatabase()

    return {
      success: true,
      message: 'Database berhasil direstore'
    }
  } catch (err) {
    console.error('Restore error:', err)

    return {
      success: false,
      message: err.message || 'Gagal restore database'
    }
  }
})

/**
 * 💾 GET DATABASE INFO
 */
ipcMain.handle('database:getInfo', async () => {
  try {
    const db = getDb()
    const stats = fs.statSync(dbPath) // ✅ pakai dbPath dari import

    const productsCount = await db.get('SELECT COUNT(*) as count FROM products')
    const transactionsCount = await db.get('SELECT COUNT(*) as count FROM transactions')
    const transactionItemsCount = await db.get('SELECT COUNT(*) as count FROM transaction_items')

    const pageSize = await db.get('PRAGMA page_size')
    const pageCount = await db.get('PRAGMA page_count')
    const databaseSize = (pageCount.page_count * pageSize.page_size) / (1024 * 1024)

    return {
      success: true,
      data: {
        path: dbPath,
        size: stats.size,
        sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        tables: {
          products: productsCount?.count || 0,
          transactions: transactionsCount?.count || 0,
          transaction_items: transactionItemsCount?.count || 0
        },
        databaseSize: databaseSize.toFixed(2)
      }
    }
  } catch (err) {
    console.error('Get database info error:', err)
    return { success: false, message: err.message || 'Gagal mendapatkan info database' }
  }
})

/**
 * 🗑️ CLEAR ALL DATA (with confirmation in frontend)
 */
ipcMain.handle('database:clearAllData', async () => {
  try {
    const db = getDb()

    // Start transaction
    await db.exec('BEGIN TRANSACTION')

    try {
      // Delete all transaction items first (due to foreign key)
      await db.run('DELETE FROM transaction_items')

      // Delete all transactions
      await db.run('DELETE FROM transactions')

      // Reset sequence for transactions
      await db.run('DELETE FROM sqlite_sequence WHERE name = "transactions"')
      await db.run('DELETE FROM sqlite_sequence WHERE name = "transaction_items"')

      await db.exec('COMMIT')

      return {
        success: true,
        message: 'Semua data transaksi berhasil dihapus'
      }
    } catch (err) {
      await db.exec('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('Clear all data error:', err)
    return {
      success: false,
      message: err.message || 'Gagal menghapus data'
    }
  }
})

/**
 * 🗑️ RESET DATABASE (clear all data including products)
 */
ipcMain.handle('database:reset', async () => {
  try {
    const db = getDb()

    // Start transaction
    await db.exec('BEGIN TRANSACTION')

    try {
      // Delete all transaction items
      await db.run('DELETE FROM transaction_items')

      // Delete all transactions
      await db.run('DELETE FROM transactions')

      // Delete all products
      await db.run('DELETE FROM products')

      // Reset sequences
      await db.run('DELETE FROM sqlite_sequence WHERE name = "products"')
      await db.run('DELETE FROM sqlite_sequence WHERE name = "transactions"')
      await db.run('DELETE FROM sqlite_sequence WHERE name = "transaction_items"')

      await db.exec('COMMIT')

      return {
        success: true,
        message: 'Database berhasil direset (semua data terhapus)'
      }
    } catch (err) {
      await db.exec('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('Reset database error:', err)
    return {
      success: false,
      message: err.message || 'Gagal mereset database'
    }
  }
})

/**
 * 💾 VACUUM DATABASE (optimize database size)
 */
ipcMain.handle('database:vacuum', async () => {
  try {
    const db = getDb()

    const sizeBefore = fs.statSync(dbPath).size // ✅ pakai dbPath dari import

    await db.exec('VACUUM')

    const sizeAfter = fs.statSync(dbPath).size // ✅ pakai dbPath dari import
    const savedSpace = sizeBefore - sizeAfter

    return {
      success: true,
      message: 'Database berhasil dioptimalkan',
      data: {
        sizeBefore,
        sizeBeforeFormatted: `${(sizeBefore / (1024 * 1024)).toFixed(2)} MB`,
        sizeAfter,
        sizeAfterFormatted: `${(sizeAfter / (1024 * 1024)).toFixed(2)} MB`,
        savedSpace,
        savedSpaceFormatted: `${(savedSpace / (1024 * 1024)).toFixed(2)} MB`
      }
    }
  } catch (err) {
    console.error('Vacuum error:', err)
    return { success: false, message: err.message || 'Gagal mengoptimalkan database' }
  }
})

/**
 * 🔍 CHECK DATABASE INTEGRITY
 */
ipcMain.handle('database:checkIntegrity', async () => {
  try {
    const db = getDb()

    // Run PRAGMA integrity_check
    const result = await db.get('PRAGMA integrity_check')

    const isOk = result.integrity_check === 'ok'

    return {
      success: true,
      data: {
        status: isOk ? 'OK' : 'Corrupted',
        message: result.integrity_check,
        isValid: isOk
      }
    }
  } catch (err) {
    console.error('Integrity check error:', err)
    return {
      success: false,
      message: err.message || 'Gagal melakukan pengecekan integrity'
    }
  }
})

/**
 * 📊 GET DATABASE STATISTICS
 */
ipcMain.handle('database:getStatistics', async () => {
  try {
    const db = getDb()

    // Get various stats
    const stats = await db.all(`
      SELECT
        'Total Products' as metric,
        COUNT(*) as value
      FROM products

      UNION ALL

      SELECT
        'Total Transactions' as metric,
        COUNT(*) as value
      FROM transactions

      UNION ALL

      SELECT
        'Total Items Sold' as metric,
        COUNT(*) as value
      FROM transaction_items

      UNION ALL

      SELECT
        'Total Revenue' as metric,
        COALESCE(SUM(total), 0) as value
      FROM transactions

      UNION ALL

      SELECT
        'Average Transaction' as metric,
        COALESCE(ROUND(AVG(total), 0), 0) as value
      FROM transactions

      UNION ALL

      SELECT
        'Today Transactions' as metric,
        COUNT(*) as value
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of day')

      UNION ALL

      SELECT
        'Today Revenue' as metric,
        COALESCE(SUM(total), 0) as value
      FROM transactions
      WHERE created_at >= strftime('%s', 'now', 'start of day')

      UNION ALL

      SELECT
        'Low Stock Products' as metric,
        COUNT(*) as value
      FROM products
      WHERE stock <= 5

      UNION ALL

      SELECT
        'Out of Stock' as metric,
        COUNT(*) as value
      FROM products
      WHERE stock = 0
    `)

    return {
      success: true,
      data: stats
    }
  } catch (err) {
    console.error('Get statistics error:', err)
    return {
      success: false,
      message: err.message || 'Gagal mendapatkan statistik database'
    }
  }
})

/**
 * 💾 EXPORT DATABASE TO SQL
 */
ipcMain.handle('database:exportSql', async () => {
  try {
    const db = getDb()

    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Database as SQL',
      defaultPath: `database-export-${Date.now()}.sql`,
      filters: [
        {
          name: 'SQL File',
          extensions: ['sql']
        }
      ]
    })

    if (!filePath) {
      return {
        success: false,
        message: 'Export dibatalkan'
      }
    }

    // Get all table schemas
    const tables = await db.all(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `)

    let sqlContent = '-- Database Export\n-- Generated: ' + new Date().toISOString() + '\n\n'
    sqlContent += 'PRAGMA foreign_keys=OFF;\n\n'

    for (const table of tables) {
      // Get create table statement
      const schema = await db.get(
        `
        SELECT sql FROM sqlite_master
        WHERE type='table' AND name=?
      `,
        table.name
      )

      if (schema && schema.sql) {
        sqlContent += schema.sql + ';\n\n'
      }

      // Get data
      const data = await db.all(`SELECT * FROM ${table.name}`)

      for (const row of data) {
        const columns = Object.keys(row)
          .map((col) => `"${col}"`)
          .join(',')
        const values = Object.values(row)
          .map((val) => {
            if (val === null) return 'NULL'
            if (typeof val === 'number') return val
            return `'${String(val).replace(/'/g, "''")}'`
          })
          .join(',')

        sqlContent += `INSERT INTO "${table.name}" (${columns}) VALUES (${values});\n`
      }

      sqlContent += '\n'
    }

    fs.writeFileSync(filePath, sqlContent)

    return {
      success: true,
      path: filePath,
      message: 'Database berhasil diexport ke SQL'
    }
  } catch (err) {
    console.error('Export SQL error:', err)
    return {
      success: false,
      message: err.message || 'Gagal mengexport database'
    }
  }
})
