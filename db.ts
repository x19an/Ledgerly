
import { AccountStatus, AccountWithTransaction, FinancialSummary, Account } from './types';

// Declare sql.js global types since we're using a CDN script
declare global {
  interface Window {
    initSqlJs: any;
  }
}

let dbInstance: any = null;

const DB_STORAGE_KEY = 'ledgerly_db_data_v4';

export const initDB = async () => {
  if (dbInstance) return dbInstance;

  const SQL = await window.initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
  });

  const savedData = localStorage.getItem(DB_STORAGE_KEY);
  
  if (savedData) {
    const uint8Array = new Uint8Array(savedData.split(',').map(Number));
    dbInstance = new SQL.Database(uint8Array);
    
    // Migration: Ensure all specific columns exist
    const columns = query("PRAGMA table_info(accounts)");
    const columnNames = columns.map((c: any) => c.name);
    
    const newCols = [
      'email', 'password', 
      'account_email', 'account_password', 
      'account_2nd_email', 'account_2nd_password', 
      'notes', 'potential_income', 'loss_reason'
    ];
    
    newCols.forEach(col => {
      if (!columnNames.includes(col)) {
        execute(`ALTER TABLE accounts ADD COLUMN ${col} TEXT`);
      }
    });
  } else {
    dbInstance = new SQL.Database();
    
    dbInstance.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        level TEXT,
        status TEXT CHECK(status IN ('watchlist', 'purchased', 'sold', 'losses')) DEFAULT 'watchlist',
        expected_price REAL,
        potential_income REAL,
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
        buy_price REAL,
        sell_price REAL,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);
    saveToStorage();
  }

  return dbInstance;
};

const saveToStorage = () => {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const binaryString = Array.from(data).join(',');
  localStorage.setItem(DB_STORAGE_KEY, binaryString);
};

export const query = (sql: string, params: any[] = []) => {
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

export const execute = (sql: string, params: any[] = []) => {
  dbInstance.run(sql, params);
  saveToStorage();
};

export const dbService = {
  getAccountsByStatus: (status: AccountStatus): AccountWithTransaction[] => {
    return query(`
      SELECT a.*, t.buy_price, t.sell_price, t.transaction_date 
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      WHERE a.status = ?
      ORDER BY a.created_at DESC
    `, [status]) as AccountWithTransaction[];
  },

  addWatchlistAccount: (identifier: string, level: string, expectedPrice: number) => {
    execute(
      `INSERT INTO accounts (identifier, level, expected_price, status) VALUES (?, ?, ?, ?)`,
      [identifier, level, expectedPrice, AccountStatus.WATCHLIST]
    );
  },

  updateAccount: (account: Partial<Account> & { id: number }) => {
    const sets: string[] = [];
    const params: any[] = [];
    
    Object.entries(account).forEach(([key, value]) => {
      if (key !== 'id') {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    });
    
    params.push(account.id);
    execute(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`, params);
  },

  purchaseAccount: (accountId: number, buyPrice: number, potentialIncome: number) => {
    execute(`UPDATE accounts SET status = ?, potential_income = ? WHERE id = ?`, [AccountStatus.PURCHASED, potentialIncome, accountId]);
    execute(
      `INSERT INTO transactions (account_id, buy_price, transaction_date) VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(account_id) DO UPDATE SET buy_price = excluded.buy_price, transaction_date = CURRENT_TIMESTAMP`,
      [accountId, buyPrice]
    );
  },

  sellAccount: (accountId: number, sellPrice: number) => {
    execute(`UPDATE accounts SET status = ? WHERE id = ?`, [AccountStatus.SOLD, accountId]);
    execute(
      `UPDATE transactions SET sell_price = ?, transaction_date = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [sellPrice, accountId]
    );
  },

  markAsLost: (accountId: number, reason: string) => {
    execute(`UPDATE accounts SET status = ?, loss_reason = ? WHERE id = ?`, [AccountStatus.LOSSES, reason, accountId]);
    execute(
      `UPDATE transactions SET sell_price = 0, transaction_date = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [accountId]
    );
  },

  deleteAccount: (accountId: number) => {
    execute(`DELETE FROM accounts WHERE id = ?`, [accountId]);
    execute(`DELETE FROM transactions WHERE account_id = ?`, [accountId]);
  },

  getSummary: (): FinancialSummary => {
    const counts = query(`
      SELECT 
        SUM(CASE WHEN status = 'watchlist' THEN 1 ELSE 0 END) as watchlistCount,
        SUM(CASE WHEN status = 'purchased' THEN 1 ELSE 0 END) as purchasedCount,
        SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as soldCount,
        SUM(CASE WHEN status = 'losses' THEN 1 ELSE 0 END) as lossesCount
      FROM accounts
    `)[0];

    const financials = query(`
      SELECT 
        SUM(buy_price) as totalSpent,
        SUM(sell_price) as totalEarned
      FROM transactions
    `)[0];

    const lostMoney = query(`
      SELECT SUM(t.buy_price) as totalLost
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      WHERE a.status = 'losses'
    `)[0];

    const potential = query(`
      SELECT SUM(potential_income) as potentialRevenue 
      FROM accounts 
      WHERE status = 'purchased'
    `)[0];

    return {
      watchlistCount: Number(counts.watchlistCount || 0),
      purchasedCount: Number(counts.purchasedCount || 0),
      soldCount: Number(counts.soldCount || 0),
      lossesCount: Number(counts.lossesCount || 0),
      totalSpent: Number(financials.totalSpent || 0),
      totalEarned: Number(financials.totalEarned || 0),
      totalLost: Number(lostMoney.totalLost || 0),
      netProfit: Number((financials.totalEarned || 0) - (financials.totalSpent || 0)),
      potentialRevenue: Number(potential.potentialRevenue || 0)
    };
  }
};
