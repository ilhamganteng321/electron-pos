import { ipcMain } from 'electron'
import db from '../db.js'

/**
 * ➕ CREATE
 */
ipcMain.handle('product:add', (_, data) => {
  try {
    if (!data.name || data.price == null) {
      throw new Error('Name & price wajib diisi')
    }

    const stmt = db.prepare(`
      INSERT INTO products (name, price, stock)
      VALUES (?, ?, ?)
    `)

    const result = stmt.run(data.name, data.price, data.stock ?? 0)

    return {
      success: true,
      id: result.lastInsertRowid
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

/**
 * 📦 READ ALL
 */
ipcMain.handle('product:getAll', () => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM products ORDER BY id DESC
    `)

    const data = stmt.all()

    return { success: true, data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

/**
 * 🔍 READ BY ID
 */
ipcMain.handle('product:getById', (_, id) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `)

    const data = stmt.get(id)

    return { success: true, data }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

/**
 * ✏️ UPDATE
 */
ipcMain.handle('product:update', (_, data) => {
  try {
    if (!data.id) throw new Error('ID wajib')

    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, price = ?, stock = ?
      WHERE id = ?
    `)

    const result = stmt.run(data.name, data.price, data.stock ?? 0, data.id)

    return {
      success: true,
      changes: result.changes
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

/**
 * ❌ DELETE
 */
ipcMain.handle('product:delete', (_, id) => {
  try {
    const stmt = db.prepare(`
      DELETE FROM products WHERE id = ?
    `)

    const result = stmt.run(id)

    return {
      success: true,
      changes: result.changes
    }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})
