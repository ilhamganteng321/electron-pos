// electron/ipc/transaction.js
import { ipcMain } from 'electron'
import db from '../db.js'

ipcMain.handle('transaction:add', async (_, payload) => {
  const { items, paid } = payload

  // Validasi input
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'Items tidak valid atau kosong' }
  }

  if (typeof paid !== 'number' || paid < 0) {
    return { success: false, error: 'Nominal pembayaran tidak valid' }
  }

  try {
    const result = db.transaction(() => {
      let total = 0

      // Hitung total dari semua items
      for (const item of items) {
        if (!item.product_id || !item.qty || !item.price) {
          throw new Error(`Data item tidak lengkap: ${JSON.stringify(item)}`)
        }
        if (item.qty <= 0) {
          throw new Error(`Quantity harus lebih dari 0 untuk produk ID ${item.product_id}`)
        }
        total += item.price * item.qty
      }

      // Validasi pembayaran
      if (paid < total) {
        throw new Error(`Pembayaran kurang: Rp ${(total - paid).toLocaleString('id-ID')}`)
      }

      const change = paid - total

      // Insert header transaksi
      const trxStmt = db.prepare(`
        INSERT INTO transactions (total, paid, change, created_at)
        VALUES (?, ?, ?, strftime('%s', 'now'))
      `)

      const trxResult = trxStmt.run(total, paid, change)
      const transactionId = trxResult.lastInsertRowid

      // Prepare statements untuk performa lebih baik
      const itemStmt = db.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, qty, price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `)

      const stockStmt = db.prepare(`
        UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
      `)

      // Proses setiap item
      for (const item of items) {
        // Cek stok sebelum insert
        const checkStockStmt = db.prepare(`
          SELECT id, name, stock FROM products WHERE id = ?
        `)

        const product = checkStockStmt.get(item.product_id)

        if (!product) {
          throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`)
        }

        if (product.stock < item.qty) {
          throw new Error(
            `Stok tidak cukup untuk produk "${product.name}". ` +
              `Stok tersedia: ${product.stock}, diminta: ${item.qty}`
          )
        }

        // Insert item transaksi
        const subtotal = item.price * item.qty
        itemStmt.run(transactionId, item.product_id, item.qty, item.price, subtotal)

        // Kurangi stok dengan validasi
        const updateResult = stockStmt.run(item.qty, item.product_id, item.qty)

        if (updateResult.changes === 0) {
          throw new Error(`Gagal mengupdate stok untuk produk ID ${item.product_id}`)
        }
      }

      // Ambil data detail transaksi yang baru saja dibuat
      const getTransactionStmt = db.prepare(`
        SELECT
          t.id,
          t.total,
          t.paid,
          t.change,
          t.created_at,
          json_group_array(
            json_object(
              'product_id', ti.product_id,
              'product_name', p.name,
              'qty', ti.qty,
              'price', ti.price,
              'subtotal', ti.subtotal
            )
          ) as items
        FROM transactions t
        JOIN transaction_items ti ON t.id = ti.transaction_id
        JOIN products p ON ti.product_id = p.id
        WHERE t.id = ?
        GROUP BY t.id
      `)

      const transactionDetail = getTransactionStmt.get(transactionId)

      // Parse items dari JSON string
      if (transactionDetail && transactionDetail.items) {
        transactionDetail.items = JSON.parse(transactionDetail.items)
      }

      return {
        id: transactionId,
        total,
        paid,
        change,
        items: transactionDetail?.items || items,
        created_at: transactionDetail?.created_at
      }
    })()

    return { success: true, data: result }
  } catch (err) {
    console.error('Transaction error:', err)
    return {
      success: false,
      error: err.message || 'Terjadi kesalahan saat memproses transaksi'
    }
  }
})

ipcMain.handle('transaction:getAll', async () => {
  try {
    const stmt = db.prepare(`
      SELECT
  t.*,
  COALESCE(
    json_group_array(
      json_object(
        'product_id', ti.product_id,
        'product_name', p.name,
        'qty', ti.qty,
        'price', ti.price,
        'subtotal', ti.subtotal
      )
    ),
    '[]'
  ) AS items
FROM transactions t
LEFT JOIN transaction_items ti
  ON t.id = ti.transaction_id
LEFT JOIN products p
  ON p.id = ti.product_id
GROUP BY t.id
ORDER BY t.created_at DESC;
    `)
    const data = stmt.all()
    // Parse JSON items
    data.forEach((row) => {
      if (row.items) row.items = JSON.parse(row.items)
    })
    return { success: true, data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('transaction:getById', (_, id) => {
  try {
    const trx = db
      .prepare(
        `
      SELECT * FROM transactions WHERE id = ?
    `
      )
      .get(id)

    if (!trx) {
      return { success: false, error: 'Transaksi tidak ditemukan' }
    }

    const items = db
      .prepare(
        `
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `
      )
      .all(id)

    return {
      success: true,
      data: {
        ...trx,
        items
      }
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('transaction:getReport', async (_, { startDate, endDate, period = 'daily' }) => {
  try {
    let dateFilter = ''
    let groupBy = ''

    if (startDate && endDate) {
      dateFilter = `AND t.created_at BETWEEN strftime('%s', '${startDate}') AND strftime('%s', '${endDate} 23:59:59')`
    }

    switch (period) {
      case 'daily':
        groupBy = `strftime('%Y-%m-%d', t.created_at, 'unixepoch')`
        break
      case 'monthly':
        groupBy = `strftime('%Y-%m', t.created_at, 'unixepoch')`
        break
      case 'yearly':
        groupBy = `strftime('%Y', t.created_at, 'unixepoch')`
        break
      default:
        groupBy = `strftime('%Y-%m-%d', t.created_at, 'unixepoch')`
    }

    const query = `
      SELECT
        ${groupBy} as period,
        COUNT(t.id) as total_transactions,
        SUM(t.total) as total_revenue,
        SUM(t.paid) as total_paid,
        SUM(t.change) as total_change,
        AVG(t.total) as avg_transaction_value,
        MIN(t.total) as min_transaction,
        MAX(t.total) as max_transaction,
        SUM(CASE WHEN strftime('%Y-%m-%d', t.created_at, 'unixepoch') = strftime('%Y-%m-%d', 'now') THEN 1 ELSE 0 END) as today_transactions,
        SUM(CASE WHEN strftime('%Y-%m-%d', t.created_at, 'unixepoch') = strftime('%Y-%m-%d', 'now') THEN t.total ELSE 0 END) as today_revenue
      FROM transactions t
      WHERE 1=1 ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `

    const summary = db.prepare(query).all()

    return { success: true, data: summary }
  } catch (err) {
    console.error('Report error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get best selling products
ipcMain.handle('transaction:getBestSelling', async (_, { limit = 10, startDate, endDate }) => {
  try {
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND t.created_at BETWEEN strftime('%s', '${startDate}') AND strftime('%s', '${endDate} 23:59:59')`
    }

    const query = `
      SELECT
        p.id,
        p.name,
        SUM(ti.qty) as total_sold,
        SUM(ti.subtotal) as total_revenue,
        COUNT(DISTINCT t.id) as times_purchased,
        p.stock as current_stock
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE 1=1 ${dateFilter}
      GROUP BY p.id, p.name, p.stock
      ORDER BY total_sold DESC
      LIMIT ?
    `

    const bestSelling = db.prepare(query).all(limit)

    return { success: true, data: bestSelling }
  } catch (err) {
    console.error('Best selling error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get daily sales heatmap
ipcMain.handle('transaction:getHourlySales', async (_, { date }) => {
  try {
    const query = `
      SELECT
        strftime('%H', datetime(t.created_at, 'unixepoch')) as hour,
        COUNT(t.id) as transactions,
        SUM(t.total) as revenue,
        COUNT(ti.id) as items_sold
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE strftime('%Y-%m-%d', t.created_at, 'unixepoch') = ?
      GROUP BY hour
      ORDER BY hour ASC
    `

    const hourlyData = db.prepare(query).all(date)

    return { success: true, data: hourlyData }
  } catch (err) {
    console.error('Hourly sales error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get inventory status
ipcMain.handle('transaction:getInventoryReport', async () => {
  try {
    const query = `
      SELECT
        COUNT(*) as total_products,
        SUM(stock) as total_stock,
        SUM(stock * price) as total_inventory_value,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock <= 5 AND stock > 0 THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock > 5 THEN 1 END) as well_stocked,
        AVG(price) as avg_price
      FROM products
    `

    const inventorySummary = db.prepare(query).get()

    // Get products by stock status
    const productsByStock = db
      .prepare(
        `
      SELECT
        CASE
          WHEN stock = 0 THEN 'Habis'
          WHEN stock <= 5 THEN 'Menipis'
          ELSE 'Tersedia'
        END as status,
        COUNT(*) as count,
        SUM(stock) as total_stock,
        SUM(stock * price) as total_value
      FROM products
      GROUP BY status
    `
      )
      .all()

    return {
      success: true,
      data: {
        summary: inventorySummary,
        byStatus: productsByStock
      }
    }
  } catch (err) {
    console.error('Inventory report error:', err)
    return { success: false, error: String(err) }
  }
})
