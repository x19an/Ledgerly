
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'ledgerly.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database', err);
  else console.log('Connected to SQLite database at:', dbPath);
});

// Initialize Schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL,
      link TEXT,
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
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER UNIQUE,
      buy_price REAL,
      sell_price REAL,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);
});

// Endpoints
app.get('/api/accounts', (req, res) => {
  const { status } = req.query;
  const sql = `
    SELECT a.*, t.buy_price, t.sell_price, t.transaction_date 
    FROM accounts a
    LEFT JOIN transactions t ON a.id = t.account_id
    WHERE a.status = ?
    ORDER BY a.created_at DESC
  `;
  db.all(sql, [status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/accounts/watchlist', (req, res) => {
  const { identifier, link, expected_price } = req.body;
  const sql = `INSERT INTO accounts (identifier, link, expected_price, status) VALUES (?, ?, ?, 'watchlist')`;
  db.run(sql, [identifier, link, expected_price], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.patch('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  const sql = `UPDATE accounts SET ${sets} WHERE id = ?`;
  db.run(sql, [...values, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.post('/api/accounts/:id/purchase', (req, res) => {
  const { id } = req.params;
  const { buy_price, potential_income } = req.body;
  db.serialize(() => {
    db.run(`UPDATE accounts SET status = 'purchased', potential_income = ? WHERE id = ?`, [potential_income, id]);
    db.run(`
      INSERT INTO transactions (account_id, buy_price, transaction_date) VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(account_id) DO UPDATE SET buy_price = excluded.buy_price, transaction_date = CURRENT_TIMESTAMP
    `, [id, buy_price], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.post('/api/accounts/:id/sell', (req, res) => {
  const { id } = req.params;
  const { sell_price } = req.body;
  db.serialize(() => {
    db.run(`UPDATE accounts SET status = 'sold' WHERE id = ?`, [id]);
    db.run(`UPDATE transactions SET sell_price = ?, transaction_date = CURRENT_TIMESTAMP WHERE account_id = ?`, [sell_price, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.post('/api/accounts/:id/loss', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  db.serialize(() => {
    db.run(`UPDATE accounts SET status = 'losses', loss_reason = ? WHERE id = ?`, [reason, id]);
    db.run(`UPDATE transactions SET sell_price = 0, transaction_date = CURRENT_TIMESTAMP WHERE account_id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.delete('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run(`DELETE FROM accounts WHERE id = ?`, [id]);
    db.run(`DELETE FROM transactions WHERE account_id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: true });
    });
  });
});

app.get('/api/summary', (req, res) => {
  const sqlCounts = `
    SELECT 
      SUM(CASE WHEN status = 'watchlist' THEN 1 ELSE 0 END) as watchlistCount,
      SUM(CASE WHEN status = 'purchased' THEN 1 ELSE 0 END) as purchasedCount,
      SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as soldCount,
      SUM(CASE WHEN status = 'losses' THEN 1 ELSE 0 END) as lossesCount
    FROM accounts
  `;
  const sqlFin = `
    SELECT 
      SUM(buy_price) as totalSpent,
      SUM(sell_price) as totalEarned
    FROM transactions
  `;
  const sqlLost = `
    SELECT SUM(t.buy_price) as totalLost
    FROM transactions t
    JOIN accounts a ON a.id = t.account_id
    WHERE a.status = 'losses'
  `;
  const sqlPot = `
    SELECT SUM(potential_income) as potentialRevenue 
    FROM accounts 
    WHERE status = 'purchased'
  `;

  db.get(sqlCounts, (err, counts) => {
    db.get(sqlFin, (err, fin) => {
      db.get(sqlLost, (err, lost) => {
        db.get(sqlPot, (err, pot) => {
          res.json({
            watchlistCount: counts.watchlistCount || 0,
            purchasedCount: counts.purchasedCount || 0,
            soldCount: counts.soldCount || 0,
            lossesCount: counts.lossesCount || 0,
            totalSpent: fin.totalSpent || 0,
            totalEarned: fin.totalEarned || 0,
            totalLost: lost.totalLost || 0,
            netProfit: (fin.totalEarned || 0) - (fin.totalSpent || 0),
            potentialRevenue: pot.potentialRevenue || 0
          });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Ledgerly Backend running at http://localhost:${port}`);
});
