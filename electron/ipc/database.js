// electron/ipc/database.js
import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import { closeDatabase, initDatabase, dbPath, getDb } from '../db'
import * as XLSX from 'xlsx'

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

ipcMain.handle('database:exportCsv', async (event, { tableName } = {}) => {
  try {
    const db = getDb()

    // If no specific table, export all tables as separate files or combined
    const tables = tableName
      ? [{ name: tableName }]
      : await db.all(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `)

    const { filePath } = await dialog.showSaveDialog({
      title: 'Export to CSV',
      defaultPath: `export-${tableName || 'all'}-${Date.now()}.csv`,
      filters: [{ name: 'CSV File', extensions: ['csv'] }]
    })

    if (!filePath) {
      return { success: false, message: 'Export dibatalkan' }
    }

    let allData = []

    for (const table of tables) {
      const data = await db.all(`SELECT * FROM ${table.name}`)

      if (tableName) {
        allData = data
      } else {
        // Add table name as column
        data.forEach((row) => {
          row._table_name = table.name
          allData.push(row)
        })
      }
    }

    // Convert to CSV
    const csv = convertToCSV(allData)
    fs.writeFileSync(filePath, csv, 'utf-8')

    return {
      success: true,
      path: filePath,
      message: `Data berhasil diexport ke CSV (${allData.length} rows)`
    }
  } catch (err) {
    console.error('Export CSV error:', err)
    return { success: false, message: err.message || 'Gagal export ke CSV' }
  }
})

/**
 * 📊 EXPORT TO EXCEL (XLSX)
 */
// electron/ipc/database.js - Bagian exportExcel yang sudah diperbaiki total

ipcMain.handle('database:exportExcel', async (_, options = {}) => {
  try {
    const db = getDb()

    // Tentukan table export
    const tables = []

    if (options.includeProducts) {
      tables.push({ name: 'products' })
    }

    if (options.includeTransactions) {
      tables.push({ name: 'transactions' })
    }

    if (options.includeTransactionItems) {
      tables.push({ name: 'transaction_items' })
    }

    if (tables.length === 0) {
      return {
        success: false,
        message: 'Tidak ada data yang dipilih untuk export'
      }
    }

    const { filePath } = await dialog.showSaveDialog({
      title: 'Export to Excel',
      defaultPath: `export-database-${Date.now()}.xlsx`,
      filters: [
        {
          name: 'Excel File',
          extensions: ['xlsx']
        }
      ]
    })

    if (!filePath) {
      return {
        success: false,
        message: 'Export dibatalkan'
      }
    }

    const workbook = XLSX.utils.book_new()

    // ==========================================
    // FUNGSI FORMAT TANGGAL YANG SUPER LENGKAP
    // ==========================================
    const formatToIndonesianDate = (value) => {
      if (value === null || value === undefined || value === '') {
        return ''
      }

      let date = null

      // 1. Jika sudah dalam format string ISO atau datetime
      if (typeof value === 'string') {
        // Coba parse langsung
        date = new Date(value)

        // Jika gagal, coba format "YYYY-MM-DD HH:MM:SS"
        if (isNaN(date.getTime())) {
          const parts = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
          if (parts) {
            date = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6])
          }
        }
      }

      // 2. Coba sebagai Unix timestamp (angka)
      if (!date || isNaN(date.getTime())) {
        if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
          const num = Number(value)
          const len = String(num).length

          if (len === 10) {
            // Unix timestamp detik
            date = new Date(num * 1000)
          } else if (len === 13) {
            // Unix timestamp milidetik
            date = new Date(num)
          }
        }
      }

      // 3. Jika masih gagal, coba berbagai format lain
      if (!date || isNaN(date.getTime())) {
        if (typeof value === 'string') {
          // Coba format "DD/MM/YYYY"
          const parts = value.split('/')
          if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
          }

          // Coba format "DD-MM-YYYY"
          if (isNaN(date.getTime())) {
            const partsDash = value.split('-')
            if (partsDash.length === 3 && partsDash[0].length === 2) {
              date = new Date(`${partsDash[2]}-${partsDash[1]}-${partsDash[0]}`)
            }
          }
        }
      }

      // 4. Format ke bahasa Indonesia jika berhasil
      if (date && !isNaN(date.getTime())) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        const months = [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember'
        ]

        const dayName = days[date.getDay()]
        const day = date.getDate()
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        // Format: Selasa, 02 Januari 2025 14:30:45
        return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds}`
      }

      // 5. Jika tidak bisa diparse, kembalikan asli
      return value
    }

    // Loop semua table
    for (const table of tables) {
      let query = `SELECT * FROM ${table.name}`
      const params = []

      // Filter tanggal untuk transaksi
      if (
        ['transactions', 'transaction_items'].includes(table.name) &&
        options.dateFrom &&
        options.dateTo
      ) {
        if (table.name === 'transaction_items') {
          query = `
            SELECT ti.*
            FROM transaction_items ti
            JOIN transactions t
              ON t.id = ti.transaction_id
            WHERE date(t.created_at) BETWEEN ? AND ?
          `
        } else {
          // Perbaikan filter untuk format datetime
          query += `
            WHERE date(created_at) BETWEEN ? AND ?
          `
        }
        params.push(options.dateFrom, options.dateTo)
      }

      const data = await db.all(query, params)

      // Format semua data dengan format tanggal Indonesia
      const formattedData = data.map((row) => {
        const newRow = {}

        Object.keys(row).forEach((key) => {
          let value = row[key]

          // Kolom yang berhubungan dengan tanggal/waktu
          const dateKeywords = [
            'created_at',
            'updated_at',
            'deleted_at',
            'date',
            'transaction_date',
            'due_date',
            'paid_at',
            'modified_at',
            'birthdate',
            'birthday'
          ]

          const isDateColumn = dateKeywords.some((keyword) => key.toLowerCase().includes(keyword))

          if (isDateColumn && value !== null && value !== undefined && value !== '') {
            // Format tanggal
            newRow[key] = formatToIndonesianDate(value)
          } else if (value === null) {
            newRow[key] = ''
          } else if (typeof value === 'number') {
            // Format currency untuk kolom tertentu
            if (
              key === 'total' ||
              key === 'paid' ||
              key === 'change' ||
              key === 'price' ||
              key === 'subtotal'
            ) {
              newRow[key] = `Rp ${value.toLocaleString('id-ID')}`
            } else {
              newRow[key] = value
            }
          } else {
            newRow[key] = value
          }
        })

        return newRow
      })

      // Buat worksheet
      const worksheet =
        formattedData.length > 0
          ? XLSX.utils.json_to_sheet(formattedData)
          : XLSX.utils.json_to_sheet([])

      // Auto width columns
      if (formattedData.length > 0) {
        worksheet['!cols'] = Object.keys(formattedData[0]).map((key) => {
          let maxLength = key.length

          formattedData.forEach((row) => {
            if (row[key]) {
              const valueLength = String(row[key]).length
              maxLength = Math.max(maxLength, valueLength)
            }
          })

          return {
            wch: Math.min(maxLength + 2, 50)
          }
        })
      }

      // Freeze header
      worksheet['!freeze'] = {
        xSplit: 0,
        ySplit: 1
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, table.name.slice(0, 31))
    }

    XLSX.writeFile(workbook, filePath)

    return {
      success: true,
      path: filePath,
      message: `Berhasil export ${tables.length} table ke Excel`
    }
  } catch (err) {
    console.error('Export Excel error:', err)
    return {
      success: false,
      message: err.message || 'Gagal export ke Excel'
    }
  }
})

function convertToCSV(data) {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(','))

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      let value = row[header]

      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }

      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      // Escape quotes and wrap in quotes if contains comma or newline
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""')
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`
        }
      }

      return value
    })

    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}
