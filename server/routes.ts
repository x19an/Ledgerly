
import { Router } from 'express';
import { getDB } from './database';

const router = Router();

router.get('/accounts', async (req, res) => {
  try {
    const db = await getDB();
    const { status, search } = req.query;
    let query = `
      SELECT a.*, t.buy_price, t.sell_price, t.transaction_date 
      FROM accounts a 
      LEFT JOIN transactions t ON a.id = t.account_id
    `;
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (status) {
      conditions.push(`a.status = ?`);
      params.push(status);
    }
    if (search) {
      conditions.push(`(a.identifier LIKE ? OR a.category LIKE ? OR a.notes LIKE ?)`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += ` ORDER BY a.updated_at DESC`;
    
    const accounts = await db.all(query, params);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const db = await getDB();
    const { identifier, link, category, expected_price, notes } = req.body;
    
    const result = await db.run(
      `INSERT INTO accounts (identifier, link, category, expected_price, notes, status) VALUES (?, ?, ?, ?, ?, 'watchlist')`,
      [identifier, link, category, expected_price, notes]
    );
    
    res.status(201).json({ id: result.lastID, identifier, status: 'watchlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.put('/accounts/:id', async (req, res) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        const updates = req.body;
        
        delete updates.id;
        delete updates.created_at; 
        delete updates.updated_at;
        
        const keys = Object.keys(updates);
        if (keys.length === 0) return res.json({ success: true });

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => updates[key]);
        
        await db.run(`UPDATE accounts SET ${setClause} WHERE id = ?`, [...values, id]);
        res.json({ success: true });
    } catch(error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

router.delete('/accounts/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM accounts WHERE id = ?', req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

router.post('/accounts/:id/purchase', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { buy_price, potential_income } = req.body;

    await db.run(`UPDATE accounts SET status = 'purchased', potential_income = ? WHERE id = ?`, [potential_income, id]);
    await db.run(
      `INSERT INTO transactions (account_id, buy_price) VALUES (?, ?) ON CONFLICT(account_id) DO UPDATE SET buy_price = ?`,
      [id, buy_price, buy_price]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

router.post('/accounts/:id/sell', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    const { sell_price } = req.body;

    await db.run(`UPDATE accounts SET status = 'sold' WHERE id = ?`, [id]);
    await db.run(`UPDATE transactions SET sell_price = ? WHERE account_id = ?`, [sell_price, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Sell failed' });
  }
});

router.post('/accounts/:id/loss', async (req, res) => {
  try {
    const db = await getDB();
    const { id } = req.params;
    await db.run(`UPDATE accounts SET status = 'losses', loss_reason = ? WHERE id = ?`, [req.body.loss_reason, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Loss report failed' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const db = await getDB();
    
    const stats = await db.get(`
      SELECT
        COALESCE(SUM(t.buy_price), 0) as total_spent,
        COALESCE(SUM(t.sell_price), 0) as total_earned,
        (SELECT COALESCE(SUM(t3.buy_price), 0) FROM transactions t3 JOIN accounts a3 ON t3.account_id = a3.id WHERE a3.status = 'losses') as total_lost,
        ((SELECT COALESCE(SUM(t2.sell_price - t2.buy_price), 0) FROM transactions t2 JOIN accounts a2 ON t2.account_id = a2.id WHERE a2.status = 'sold') - 
         (SELECT COALESCE(SUM(t4.buy_price), 0) FROM transactions t4 JOIN accounts a4 ON t4.account_id = a4.id WHERE a4.status = 'losses')) as net_profit,
        (SELECT COALESCE(SUM(potential_income), 0) FROM accounts WHERE status = 'purchased') as potential_revenue
      FROM transactions t
    `);

    const countsResult = await db.all(`SELECT status, COUNT(*) as count FROM accounts GROUP BY status`);
    const counts = { watchlist: 0, purchased: 0, sold: 0, losses: 0 };
    countsResult.forEach(row => { if (counts.hasOwnProperty(row.status)) (counts as any)[row.status] = row.count; });

    // Mock trend for sparkline
    const profit_trend = [30, 45, 35, 60, 50, 80, stats.net_profit || 0];

    res.json({ ...stats, counts, profit_trend });
  } catch (error) {
    res.status(500).json({ error: 'Summary failed' });
  }
});

export default router;
