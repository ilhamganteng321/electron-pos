// electron/ipc/transaction.js
import { ipcMain } from 'electron'
import { getDb } from '../db.js'

// Helper function untuk validasi input
const validateTransactionInput = (items, paid) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Items tidak valid atau kosong' }
  }

  if (typeof paid !== 'number' || paid < 0) {
    return { valid: false, error: 'Nominal pembayaran tidak valid' }
  }

  for (const item of items) {
    if (!item.product_id || !item.qty || !item.price) {
      return { valid: false, error: `Data item tidak lengkap: ${JSON.stringify(item)}` }
    }
    if (item.qty <= 0) {
      return {
        valid: false,
        error: `Quantity harus lebih dari 0 untuk produk ID ${item.product_id}`
      }
    }
  }

  return { valid: true }
}

ipcMain.handle('transaction:add', async (_, payload) => {
  const { items, paid } = payload
  const db = getDb()

  // Validasi input
  const validation = validateTransactionInput(items, paid)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    // Hitung total terlebih dahulu
    let total = 0
    for (const item of items) {
      total += item.price * item.qty
    }

    // Validasi pembayaran
    if (paid < total) {
      return {
        success: false,
        error: `Pembayaran kurang: Rp ${(total - paid).toLocaleString('id-ID')}`
      }
    }

    const change = paid - total

    // Mulai transaksi database
    await db.exec('BEGIN TRANSACTION')

    try {
      // Insert header transaksi
      const trxResult = await db.run(
        `
        INSERT INTO transactions (total, paid, change, created_at)
        VALUES (?, ?, ?, strftime('%s', 'now', 'localtime'))
      `,
        total,
        paid,
        change
      )

      const transactionId = trxResult.lastID

      // Prepare statements untuk setiap item
      for (const item of items) {
        // Cek stok produk
        const product = await db.get(
          `
          SELECT id, name, stock FROM products WHERE id = ?
        `,
          item.product_id
        )

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
        await db.run(
          `
          INSERT INTO transaction_items (transaction_id, product_id, qty, price, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `,
          transactionId,
          item.product_id,
          item.qty,
          item.price,
          subtotal
        )

        // Kurangi stok
        const updateResult = await db.run(
          `
          UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
        `,
          item.qty,
          item.product_id,
          item.qty
        )

        if (updateResult.changes === 0) {
          throw new Error(`Gagal mengupdate stok untuk produk ID ${item.product_id}`)
        }
      }

      // Ambil data detail transaksi yang baru saja dibuat
      const transactionDetail = await db.get(
        `
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
      `,
        transactionId
      )

      // Commit transaksi
      await db.exec('COMMIT')

      // Parse items dari JSON string
      let parsedItems = items
      if (transactionDetail && transactionDetail.items) {
        try {
          parsedItems = JSON.parse(transactionDetail.items)
        } catch (e) {
          console.error('Error parsing items JSON:', e)
        }
      }

      return {
        success: true,
        data: {
          id: transactionId,
          total,
          paid,
          change,
          items: parsedItems,
          created_at: transactionDetail?.created_at
        }
      }
    } catch (err) {
      // Rollback jika ada error
      await db.exec('ROLLBACK')
      throw err
    }
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
    const db = getDb()

    const data = await db.all(`
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
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN products p ON p.id = ti.product_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `)

    // Parse JSON items untuk setiap transaksi
    data.forEach((row) => {
      if (row.items) {
        try {
          row.items = JSON.parse(row.items)
          // Filter out items dengan product_id null (dari LEFT JOIN)
          if (Array.isArray(row.items)) {
            row.items = row.items.filter((item) => item.product_id !== null)
          }
        } catch (e) {
          console.log(e)
          row.items = []
        }
      } else {
        row.items = []
      }
    })

    return { success: true, data }
  } catch (err) {
    console.error('Get all transactions error:', err)
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('transaction:getById', async (_, id) => {
  try {
    const db = getDb()

    const trx = await db.get(
      `
      SELECT * FROM transactions WHERE id = ?
    `,
      id
    )

    if (!trx) {
      return { success: false, error: 'Transaksi tidak ditemukan' }
    }

    const items = await db.all(
      `
      SELECT
        ti.*,
        p.name as product_name
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      WHERE ti.transaction_id = ?
    `,
      id
    )

    return {
      success: true,
      data: {
        ...trx,
        items
      }
    }
  } catch (err) {
    console.error('Get transaction by id error:', err)
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('transaction:getReport', async (_, { startDate, endDate, period = 'daily' }) => {
  try {
    const db = getDb()

    let dateFilter = ''
    let groupBy = ''

    if (startDate && endDate) {
      dateFilter = `AND t.created_at BETWEEN strftime('%s', '${startDate}') AND strftime('%s', '${endDate} 23:59:59')`
    }

    switch (period) {
      case 'daily':
        groupBy = `strftime('%Y-%m-%d', t.created_at, 'unixepoch', 'localtime')`
        break
      case 'monthly':
        groupBy = `strftime('%Y-%m', t.created_at, 'unixepoch', 'localtime')`
        break
      case 'yearly':
        groupBy = `strftime('%Y', t.created_at, 'unixepoch', 'localtime')`
        break
      default:
        groupBy = `strftime('%Y-%m-%d', t.created_at, 'unixepoch', 'localtime')`
    }

    const query = `
      SELECT
        ${groupBy} as period,
        COUNT(t.id) as total_transactions,
        COALESCE(SUM(t.total), 0) as total_revenue,
        COALESCE(SUM(t.paid), 0) as total_paid,
        COALESCE(SUM(t.change), 0) as total_change,
        COALESCE(AVG(t.total), 0) as avg_transaction_value,
        COALESCE(MIN(t.total), 0) as min_transaction,
        COALESCE(MAX(t.total), 0) as max_transaction,
        SUM(CASE WHEN strftime('%Y-%m-%d', t.created_at, 'unixepoch', 'localtime') = strftime('%Y-%m-%d', 'now', 'localtime') THEN 1 ELSE 0 END) as today_transactions,
        SUM(CASE WHEN strftime('%Y-%m-%d', t.created_at, 'unixepoch', 'localtime') = strftime('%Y-%m-%d', 'now', 'localtime') THEN t.total ELSE 0 END) as today_revenue
      FROM transactions t
      WHERE 1=1 ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `

    const summary = await db.all(query)

    return { success: true, data: summary }
  } catch (err) {
    console.error('Report error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get best selling products
ipcMain.handle('transaction:getBestSelling', async (_, { limit = 10, startDate, endDate }) => {
  try {
    const db = getDb()

    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND t.created_at BETWEEN strftime('%s', '${startDate}') AND strftime('%s', '${endDate} 23:59:59')`
    }

    const query = `
      SELECT
        p.id,
        p.name,
        COALESCE(SUM(ti.qty), 0) as total_sold,
        COALESCE(SUM(ti.subtotal), 0) as total_revenue,
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

    const bestSelling = await db.all(query, limit)

    return { success: true, data: bestSelling }
  } catch (err) {
    console.error('Best selling error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get daily sales heatmap
ipcMain.handle('transaction:getHourlySales', async (_, { date }) => {
  try {
    const db = getDb()

    const query = `
      SELECT
        strftime('%H', datetime(t.created_at, 'unixepoch', 'localtime')) as hour,
        COUNT(t.id) as transactions,
        COALESCE(SUM(t.total), 0) as revenue,
        COUNT(ti.id) as items_sold
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE strftime('%Y-%m-%d', t.created_at, 'unixepoch', 'localtime') = ?
      GROUP BY hour
      ORDER BY hour ASC
    `

    const hourlyData = await db.all(query, date)

    return { success: true, data: hourlyData }
  } catch (err) {
    console.error('Hourly sales error:', err)
    return { success: false, error: String(err) }
  }
})

// 📊 LAPORAN: Get inventory status
ipcMain.handle('transaction:getInventoryReport', async () => {
  try {
    const db = getDb()

    const inventorySummary = await db.get(`
      SELECT
        COUNT(*) as total_products,
        COALESCE(SUM(stock), 0) as total_stock,
        COALESCE(SUM(stock * price), 0) as total_inventory_value,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock <= 5 AND stock > 0 THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock > 5 THEN 1 END) as well_stocked,
        COALESCE(AVG(price), 0) as avg_price
      FROM products
    `)

    // Get products by stock status
    const productsByStock = await db.all(`
      SELECT
        CASE
          WHEN stock = 0 THEN 'Habis'
          WHEN stock <= 5 THEN 'Menipis'
          ELSE 'Tersedia'
        END as status,
        COUNT(*) as count,
        COALESCE(SUM(stock), 0) as total_stock,
        COALESCE(SUM(stock * price), 0) as total_value
      FROM products
      GROUP BY status
    `)

    return {
      success: true,
      data: {
        summary: inventorySummary || {
          total_products: 0,
          total_stock: 0,
          total_inventory_value: 0,
          out_of_stock: 0,
          low_stock: 0,
          well_stocked: 0,
          avg_price: 0
        },
        byStatus: productsByStock || []
      }
    }
  } catch (err) {
    console.error('Inventory report error:', err)
    return { success: false, error: String(err) }
  }
})

// 🗑️ DELETE transaction (with stock restoration)
ipcMain.handle('transaction:delete', async (_, id) => {
  try {
    const db = getDb()

    // Mulai transaksi
    await db.exec('BEGIN TRANSACTION')

    try {
      // Ambil items dari transaksi yang akan dihapus
      const items = await db.all(
        `
        SELECT product_id, qty FROM transaction_items WHERE transaction_id = ?
      `,
        id
      )

      // Restore stok untuk setiap item
      for (const item of items) {
        await db.run(
          `
          UPDATE products SET stock = stock + ? WHERE id = ?
        `,
          item.qty,
          item.product_id
        )
      }

      // Delete transaction items
      await db.run(`DELETE FROM transaction_items WHERE transaction_id = ?`, id)

      // Delete transaction
      const result = await db.run(`DELETE FROM transactions WHERE id = ?`, id)

      await db.exec('COMMIT')

      return {
        success: true,
        changes: result.changes
      }
    } catch (err) {
      await db.exec('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('Delete transaction error:', err)
    return { success: false, error: String(err) }
  }
})
