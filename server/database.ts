import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

declare var __dirname: string;

let dbInstance: Database | null = null;

export const getDB = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  // Ensure db directory exists
  const dbDir = path.join(__dirname, 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await open({
    filename: path.join(dbDir, 'ledgerly.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      link TEXT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER UNIQUE,
      buy_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  dbInstance = db;
  return db;
};