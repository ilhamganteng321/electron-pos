// electron/db.js
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db

export const dbPath = path.join(app.getPath('userData'), 'app.db')

export async function initDatabase() {
  // buat file db jika belum ada
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '')
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  await db.exec('PRAGMA foreign_keys = ON')

  return db
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }

  return db
}
