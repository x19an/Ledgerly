
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let dbInstance: Database | null = null;

/**
 * Helper to get the Electron AppData path safely.
 */
const getUserDataPath = (): string => {
  try {
    const { app } = require('electron');
    if (app) return app.getPath('userData');
  } catch (e) {}
  return path.join(process.env.APPDATA || process.env.HOME || '.', 'Ledgerly');
};

const SETTINGS_FILE = path.join(getUserDataPath(), 'settings.json');

interface AppSettings {
  databasePath?: string;
}

/**
 * Loads settings from the persistent settings.json file.
 */
export const getSettings = (): AppSettings => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {};
};

/**
 * Saves settings to the persistent settings.json file.
 */
export const saveSettings = (settings: AppSettings) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

/**
 * Resolves the database path using:
 * 1. Saved user preference (from settings.json)
 * 2. 'db' folder next to EXE (Portable)
 * 3. 'db' folder in CWD (Dev)
 * 4. Default AppData location
 */
export const getDatabasePath = (): string => {
  const settings = getSettings();
  
  // 1. Check user-defined custom path first (The "Sticks Everytime" feature)
  if (settings.databasePath && fs.existsSync(settings.databasePath)) {
    return settings.databasePath;
  }

  // 2. Portable mode: Check next to EXE
  try {
    const exeDir = path.dirname(process.execPath);
    const exeDbPath = path.join(exeDir, 'db', 'ledgerly.db');
    if (fs.existsSync(exeDbPath)) return exeDbPath;
  } catch (e) {}

  // 3. Dev mode: Check CWD
  const cwdDbPath = path.join(process.cwd(), 'db', 'ledgerly.db');
  if (fs.existsSync(cwdDbPath)) return cwdDbPath;

  // 4. Fallback: Managed storage in AppData
  const defaultPath = path.join(getUserDataPath(), 'database', 'ledgerly.db');
  const defaultDir = path.dirname(defaultPath);
  if (!fs.existsSync(defaultDir)) fs.mkdirSync(defaultDir, { recursive: true });
  
  return defaultPath;
};

export const closeDB = async () => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};

export const getDB = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  const dbPath = getDatabasePath();
  console.log('[Database] Loading from:', dbPath);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON');

  // Initialize Schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      link TEXT,
      thumbnail_url TEXT,
      category TEXT,
      status TEXT CHECK(status IN ('watchlist', 'purchased', 'sold', 'losses')) DEFAULT 'watchlist',
      expected_price REAL DEFAULT 0,
      potential_income REAL DEFAULT 0,
      loss_reason TEXT,
      email TEXT,
      password TEXT,
      account_email TEXT,
      account_password TEXT,
      account_2nd_email TEXT,
      account_2nd_password TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER UNIQUE,
      buy_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS update_account_timestamp 
    AFTER UPDATE ON accounts
    BEGIN
      UPDATE accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  dbInstance = db;
  return db;
};
