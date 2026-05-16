// electron/ipc/product.js
import { ipcMain } from 'electron'
import { getDb } from '../db.js'

/**
 * ➕ CREATE
 */
ipcMain.handle('product:add', async (_, data) => {
  try {
    if (!data.name || data.price == null) {
      throw new Error('Name & price wajib diisi')
    }

    const db = getDb()

    const result = await db.run(
      `
      INSERT INTO products (name, price, stock)
      VALUES (?, ?, ?)
    `,
      data.name,
      data.price,
      data.stock ?? 0
    )

    return {
      success: true,
      id: result.lastID
    }
  } catch (err) {
    console.error('Error adding product:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * 📦 READ ALL
 */
ipcMain.handle('product:getAll', async () => {
  try {
    const db = getDb()

    const data = await db.all(`
      SELECT * FROM products ORDER BY id DESC
    `)

    return { success: true, data }
  } catch (err) {
    console.error('Error getting products:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * 🔍 READ BY ID
 */
ipcMain.handle('product:getById', async (_, id) => {
  try {
    const db = getDb()

    const data = await db.get(
      `
      SELECT * FROM products WHERE id = ?
    `,
      id
    )

    if (!data) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Error getting product by id:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * ✏️ UPDATE
 */
ipcMain.handle('product:update', async (_, data) => {
  try {
    if (!data.id) throw new Error('ID wajib')

    const db = getDb()

    const result = await db.run(
      `
      UPDATE products
      SET name = ?, price = ?, stock = ?
      WHERE id = ?
    `,
      data.name,
      data.price,
      data.stock ?? 0,
      data.id
    )

    if (result.changes === 0) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    return {
      success: true,
      changes: result.changes
    }
  } catch (err) {
    console.error('Error updating product:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * ❌ DELETE
 */
ipcMain.handle('product:delete', async (_, id) => {
  try {
    const db = getDb()

    // Check if product exists
    const product = await db.get('SELECT id FROM products WHERE id = ?', id)
    if (!product) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    // Check if product has transactions
    const hasTransactions = await db.get(
      `
      SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?
    `,
      id
    )

    if (hasTransactions.count > 0) {
      return {
        success: false,
        error: 'Tidak dapat menghapus produk yang sudah memiliki transaksi'
      }
    }

    const result = await db.run('DELETE FROM products WHERE id = ?', id)

    return {
      success: true,
      changes: result.changes
    }
  } catch (err) {
    console.error('Error deleting product:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * 🔍 SEARCH PRODUCTS
 */
ipcMain.handle('product:search', async (_, keyword) => {
  try {
    const db = getDb()

    const data = await db.all(
      `
      SELECT * FROM products
      WHERE name LIKE ?
      ORDER BY id DESC
    `,
      `%${keyword}%`
    )

    return { success: true, data }
  } catch (err) {
    console.error('Error searching products:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * 📊 GET LOW STOCK PRODUCTS
 */
ipcMain.handle('product:getLowStock', async (_, threshold = 5) => {
  try {
    const db = getDb()

    const data = await db.all(
      `
      SELECT * FROM products
      WHERE stock <= ?
      ORDER BY stock ASC
    `,
      threshold
    )

    return { success: true, data }
  } catch (err) {
    console.error('Error getting low stock products:', err)
    return { success: false, error: String(err) }
  }
})

/**
 * 📈 UPDATE STOCK
 */
ipcMain.handle('product:updateStock', async (_, { id, quantity, type = 'add' }) => {
  try {
    const db = getDb()

    let sql
    let params

    if (type === 'add') {
      sql = 'UPDATE products SET stock = stock + ? WHERE id = ?'
      params = [quantity, id]
    } else {
      // Check if enough stock
      const product = await db.get('SELECT stock FROM products WHERE id = ?', id)
      if (!product) {
        return { success: false, error: 'Produk tidak ditemukan' }
      }
      if (product.stock < quantity) {
        return { success: false, error: 'Stok tidak mencukupi' }
      }
      sql = 'UPDATE products SET stock = stock - ? WHERE id = ?'
      params = [quantity, id]
    }

    const result = await db.run(sql, ...params)

    if (result.changes === 0) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    return {
      success: true,
      changes: result.changes
    }
  } catch (err) {
    console.error('Error updating stock:', err)
    return { success: false, error: String(err) }
  }
})
