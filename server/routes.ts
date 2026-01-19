import { Router } from 'express';
import { getDB } from './database';

const router = Router();

// GET Accounts (optional filter by status)
router.get('/accounts', async (req, res) => {
  try {
    const db = await getDB();
    const { status } = req.query;
    let query = `
      SELECT a.*, t.buy_price, t.sell_price, t.transaction_date 
      FROM accounts a 
      LEFT JOIN transactions t ON a.id = t.account_id
    `;
    const params: any[] = [];
    
    if (status) {
      query += ` WHERE a.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY a.created_at DESC`;
    
    const accounts = await db.all(query, params);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// POST Create Account
router.post('/accounts', async (req, res) => {
  try {
    const db = await getDB();
    const { identifier, link, expected_price, notes } = req.body;
    
    const result = await db.run(
      `INSERT INTO accounts (identifier, link, expected_price, notes, status) VALUES (?, ?, ?, ?, 'watchlist')`,
      [identifier, link, expected_price, notes]
    );
    
    res.status(201).json({ id: result.lastID, identifier, status: 'watchlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// PUT Update Account
router.put('/accounts/:id', async (req, res) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        const { identifier, link, notes } = req.body;
        // Basic update for details
        await db.run(
            `UPDATE accounts SET identifier = ?, link = ?, notes = ? WHERE id = ?`,
            [identifier, link, notes, id]
        );
        res.json({ success: true });
    } catch(error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE Account
router.delete('/accounts/:id', async (req, res) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        await db.run('DELETE FROM accounts WHERE id = ?', id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// POST Purchase
router.post('/accounts/:id/purchase', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { buy_price, potential_income } = req.body;

    await db.run(
      `UPDATE accounts SET status = 'purchased', potential_income = ? WHERE id = ?`,
      [potential_income, id]
    );

    // Upsert transaction (account_id is unique)
    await db.run(
      `INSERT INTO transactions (account_id, buy_price) VALUES (?, ?) 
       ON CONFLICT(account_id) DO UPDATE SET buy_price = ?`,
      [id, buy_price, buy_price]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// POST Sell
router.post('/accounts/:id/sell', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { sell_price } = req.body;

    await db.run(`UPDATE accounts SET status = 'sold' WHERE id = ?`, [id]);
    await db.run(
      `UPDATE transactions SET sell_price = ? WHERE account_id = ?`,
      [sell_price, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Sell failed' });
  }
});

// POST Loss
router.post('/accounts/:id/loss', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { loss_reason } = req.body;

    await db.run(
      `UPDATE accounts SET status = 'losses', loss_reason = ? WHERE id = ?`,
      [loss_reason, id]
    );
    // Note: Transaction buy_price remains in transactions table for loss calc

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Loss report failed' });
  }
});

// GET Summary
router.get('/summary', async (req, res) => {
  try {
    const db = await getDB();
    
    const stats = await db.get(`
      SELECT
        COALESCE(SUM(t.buy_price), 0) as total_spent,
        COALESCE(SUM(t.sell_price), 0) as total_earned,
        (
            SELECT COALESCE(SUM(t3.buy_price), 0)
            FROM transactions t3
            JOIN accounts a3 ON t3.account_id = a3.id
            WHERE a3.status = 'losses'
        ) as total_lost,
        (
            SELECT COALESCE(SUM(t2.sell_price - t2.buy_price), 0)
            FROM transactions t2
            JOIN accounts a2 ON t2.account_id = a2.id
            WHERE a2.status = 'sold'
        ) as net_profit,
        (
            SELECT COALESCE(SUM(potential_income), 0)
            FROM accounts
            WHERE status = 'purchased'
        ) as potential_revenue
      FROM transactions t
    `);

    // Get counts
    const countsResult = await db.all(`SELECT status, COUNT(*) as count FROM accounts GROUP BY status`);
    const counts = {
      watchlist: 0,
      purchased: 0,
      sold: 0,
      losses: 0
    };
    countsResult.forEach(row => {
      if (counts.hasOwnProperty(row.status)) {
        (counts as any)[row.status] = row.count;
      }
    });

    res.json({ ...stats, counts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Summary failed' });
  }
});

export default router;
