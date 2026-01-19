
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let dbInstance: Database | null = null;

export const closeDB = async () => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};

export const getDB = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  // Use process.cwd() to ensure consistent path across different environments
  const dbDir = path.join(process.cwd(), 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await open({
    filename: path.join(dbDir, 'ledgerly.db'),
    driver: sqlite3.Database
  });

  await db.run('PRAGMA foreign_keys = ON');

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
